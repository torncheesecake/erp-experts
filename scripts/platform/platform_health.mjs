import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadTenantConfig } from "./tenant_config.mjs";
import { DEFAULT_DB_PATH, SCHEMA_PATH, databaseExists, getPersistenceSummary, queryValue } from "../../platform/persistence/db.js";
import { safeFinishRun, safeStartRun } from "./run_logger.mjs";
import { checkDbIntegrity } from "./platform_db_integrity.mjs";
import { validateTenants } from "./platform_tenant_validate.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

const requiredTenantFields = ["tenantId", "name", "domain", "baseUrl", "reportOutputPath", "dashboardRoute"];
const expectedIgnoredPaths = [
  "platform/persistence/platform.db",
  "platform/persistence/platform.db-shm",
  "platform/persistence/platform.db-wal",
  "reports/history/",
  "reports/seo-autopilot-report.json",
  "reports/seo-autopilot-report.md",
  "reports/seo-growth-opportunities.json",
  "reports/seo-internal-link-opportunities.json",
  "reports/seo-freshness-report.json",
  "reports/seo-conversion-paths.json",
  "reports/seo-opportunity-centre.json",
  "reports/seo-execution-plans.json",
  "reports/seo-action-inbox.json",
  "reports/seo-weekly-digest.md",
  "reports/sentinel-state.json",
];
const appendHeavyTables = [
  ["runs", "runCount"],
  ["snapshots", "snapshotCount"],
  ["opportunity_summaries", "opportunitySummaryCount"],
  ["plan_summaries", "planSummaryCount"],
  ["plan_approvals", "planApprovalCount"],
  ["plan_statuses", "planStatusCount"],
  ["inbox_items", "inboxItemCount"],
];
const backupPath = process.env.PLATFORM_BACKUP_PATH
  ? path.resolve(process.env.PLATFORM_BACKUP_PATH)
  : path.join(repoRoot, "platform/persistence/backups");
const dbAgeWarningDays = 7;

function rel(filePath) {
  return path.relative(repoRoot, filePath) || ".";
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function hasSqlite() {
  const result = spawnSync("sqlite3", ["--version"], { encoding: "utf8" });
  return result.status === 0;
}

function readGitignoreLines() {
  const gitignorePath = path.join(repoRoot, ".gitignore");
  if (!fs.existsSync(gitignorePath)) return [];
  return fs
    .readFileSync(gitignorePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function isIgnoredByPolicy(relativePath, patterns) {
  return patterns.some((pattern) => {
    if (pattern.endsWith("/")) {
      return relativePath === pattern || relativePath.startsWith(pattern);
    }
    return relativePath === pattern;
  });
}

function tableExists(tableName) {
  const escaped = tableName.replaceAll("'", "''");
  return queryValue(`SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '${escaped}';`) === "1";
}

function printCheck(label, status, detail = "") {
  const suffix = detail ? ` - ${detail}` : "";
  console.log(`${label}: ${status}${suffix}`);
}

function main() {
  const runId = safeStartRun({ tenantId: "erp-experts", command: "platform:health" });
  const warnings = [];
  const actions = [];
  const critical = [];

  const tenantResult = loadTenantConfig("erp-experts");
  const tenantValidation = validateTenants();
  let tenant = null;

  if (!tenantResult.ok) {
    critical.push(`Tenant config error: ${tenantResult.error}`);
  } else {
    tenant = tenantResult.config;
    const missingFields = requiredTenantFields.filter((field) => !tenant[field]);
    if (missingFields.length) {
      critical.push(`Tenant config missing required fields: ${missingFields.join(", ")}`);
    }
  }

  if (tenantValidation.status === "fail") {
    critical.push(`Tenant validation failed. Run npm run platform:tenant:validate. Failures: ${tenantValidation.failures.join("; ")}`);
  } else if (tenantValidation.status === "warn") {
    warnings.push("Tenant validation has warnings. Run npm run platform:tenant:validate.");
  }

  const sqliteAvailable = hasSqlite();
  if (!sqliteAvailable) {
    critical.push("sqlite3 command is not available, so the platform DB cannot be inspected or initialised.");
  }

  let dbStatus = "missing";
  let snapshotCount = "unknown";
  let opportunitySummaryCount = "unknown";
  let planSummaryCount = "unknown";
  let planApprovalCount = "unknown";
  let planStatusCount = "unknown";
  let inboxItemCount = "unknown";
  let latestRun = null;
  let latestPlanApproval = null;
  let latestPlanStatus = null;
  let latestInboxItem = null;
  let tenantPresent = false;
  let dbIntegrityResult = null;
  const schemaExists = fs.existsSync(SCHEMA_PATH);

  if (!schemaExists) {
    critical.push(`SQLite schema is missing: ${rel(SCHEMA_PATH)}`);
  }

  if (!fs.existsSync(backupPath)) {
    warnings.push(`Backup path is not present yet: ${rel(backupPath)}. Configure PLATFORM_BACKUP_PATH before server deployment.`);
  }

  if (!databaseExists(DEFAULT_DB_PATH)) {
    warnings.push("SQLite DB is not present yet. Run npm run platform:init before server readiness checks.");
  } else if (sqliteAvailable) {
    try {
      dbIntegrityResult = checkDbIntegrity(DEFAULT_DB_PATH);
      if (!dbIntegrityResult.readable) {
        critical.push(`SQLite DB integrity check failed: ${dbIntegrityResult.errors.join("; ") || dbIntegrityResult.integrity}`);
      }
      if (dbIntegrityResult.modifiedAt) {
        const ageMs = Date.now() - new Date(dbIntegrityResult.modifiedAt).getTime();
        const ageDays = ageMs / (24 * 60 * 60 * 1000);
        if (ageDays > dbAgeWarningDays) {
          warnings.push(`SQLite DB file is older than ${dbAgeWarningDays} days. Verify backup and monitor freshness.`);
        }
      }
      const requiredTables = [
        "tenants",
        "runs",
        "snapshots",
        "opportunity_summaries",
        "plan_summaries",
        "plan_approvals",
        "plan_statuses",
        "inbox_items",
      ];
      const missingTables = requiredTables.filter((table) => !tableExists(table));
      if (missingTables.length) {
        critical.push(`SQLite DB is missing required tables: ${missingTables.join(", ")}`);
      } else {
        tenantPresent = queryValue("SELECT COUNT(*) FROM tenants WHERE tenant_id = 'erp-experts';") === "1";
        const persistenceSummary = getPersistenceSummary(DEFAULT_DB_PATH);
        snapshotCount = persistenceSummary.snapshotCount;
        opportunitySummaryCount = persistenceSummary.opportunitySummaryCount;
        planSummaryCount = persistenceSummary.planSummaryCount;
        planApprovalCount = persistenceSummary.planApprovalCount;
        planStatusCount = persistenceSummary.planStatusCount;
        inboxItemCount = persistenceSummary.inboxItemCount;
        latestPlanApproval = persistenceSummary.latestPlanApproval;
        latestPlanStatus = persistenceSummary.latestPlanStatus;
        latestInboxItem = persistenceSummary.latestInboxItem;
        latestRun = persistenceSummary.latestRuns.find((run) => run.id !== runId) || null;
        dbStatus = tenantPresent ? "ready" : "needs tenant";
        if (!tenantPresent) {
          warnings.push("SQLite DB exists, but ERP Experts tenant is not present. Run npm run platform:init.");
        }
        appendHeavyTables.forEach(([tableName, summaryKey]) => {
          const count = Number(persistenceSummary[summaryKey] || 0);
          if (count > 1000) {
            warnings.push(`${tableName} has ${count} rows. Consider npm run platform:cleanup.`);
          }
        });
      }
    } catch (error) {
      critical.push(`Could not inspect SQLite DB: ${error.message}`);
    }
  }

  const reportBase = tenant?.reportOutputPath || "reports";
  const qaReportPath = path.join(reportBase, "resource-qa-report.json");
  const pipelineReportPath = path.join(reportBase, "seo-pipeline-summary.json");
  const autopilotReportPath = path.join(reportBase, "seo-autopilot-report.json");
  const opportunityReportPath = path.join(reportBase, "seo-opportunity-centre.json");
  const planReportPath = path.join(reportBase, "seo-execution-plans.json");
  const inboxReportPath = path.join(reportBase, "seo-action-inbox.json");
  const qaReport = readJson(qaReportPath);
  const pipelineReport = readJson(pipelineReportPath);
  const autopilotReport = readJson(autopilotReportPath);
  const opportunityReport = readJson(opportunityReportPath);
  const planReport = readJson(planReportPath);
  const inboxReport = readJson(inboxReportPath);

  if (!qaReport) critical.push(`Missing QA report: ${qaReportPath}`);
  if (!pipelineReport) critical.push(`Missing pipeline summary: ${pipelineReportPath}`);
  if (!autopilotReport) warnings.push(`Autopilot report is not present. Run npm run seo:autopilot when orchestration context is needed.`);
  if (opportunityReport && Number(opportunitySummaryCount || 0) === 0) {
    warnings.push("Opportunity report exists, but no opportunity summaries are persisted yet. Run npm run seo:opportunities after npm run platform:init.");
  }
  if (planReport && Number(planSummaryCount || 0) === 0) {
    warnings.push("Execution plan report exists, but no plan summaries are persisted yet. Run npm run seo:plans after npm run platform:init.");
  }
  if (inboxReport && Number(inboxItemCount || 0) === 0) {
    warnings.push("Action inbox report exists, but no inbox items are persisted yet. Run npm run seo:inbox after npm run platform:init.");
  }

  const gateSummary = qaReport?.gateSummary || pipelineReport?.current?.gateSummary || {};
  const pass = Number(gateSummary.pass || 0);
  const review = Number(gateSummary.needs_review || 0);
  const blocked = Number(gateSummary.blocked || 0);
  const humanReviewRecommended = Boolean(pipelineReport?.review?.humanReviewRecommended || autopilotReport?.humanReviewRecommended);
  const monitorStatus = autopilotReport?.health || (blocked > 0 || humanReviewRecommended ? "ACTION REQUIRED" : review > 0 ? "WARNING" : "HEALTHY");

  const gitignorePatterns = readGitignoreLines();
  if (!exists("docs/PINHOLE_SERVER_DEPLOYMENT_PLAN.md")) {
    critical.push("Pinhole server deployment plan is missing.");
  }

  const notIgnored = expectedIgnoredPaths.filter((ignoredPath) => !isIgnoredByPolicy(ignoredPath, gitignorePatterns));
  if (notIgnored.length) {
    warnings.push(`Expected generated/runtime paths are not ignored: ${notIgnored.join(", ")}`);
  }

  if (blocked > 0) actions.push("Blocked articles exist. Fix blocked content before deployment work.");
  if (humanReviewRecommended) actions.push("Human review is recommended by the pipeline/autopilot reports.");

  const status = critical.length ? "ACTION REQUIRED" : actions.length ? "REVIEW REQUIRED" : warnings.length ? "READY WITH WARNINGS" : "READY FOR LOCAL OPERATION";

  console.log("Platform Health");
  printCheck("Tenant", tenant?.name || "unknown", tenant?.tenantId || "not loaded");
  printCheck("Tenant validation", tenantValidation.status, `${tenantValidation.tenantsChecked} tenant${tenantValidation.tenantsChecked === 1 ? "" : "s"} checked`);
  printCheck("DB", dbStatus, rel(DEFAULT_DB_PATH));
  printCheck("Snapshots", String(snapshotCount));
  printCheck("Opportunity summaries", String(opportunitySummaryCount));
  printCheck("Plan summaries", String(planSummaryCount));
  printCheck("Approvals", String(planApprovalCount));
  printCheck("Plan statuses", String(planStatusCount));
  printCheck("Inbox items", String(inboxItemCount));
  if (dbIntegrityResult) {
    printCheck("DB integrity", dbIntegrityResult.integrity, `${dbIntegrityResult.requiredTables.length}/${dbIntegrityResult.requiredTables.length + dbIntegrityResult.missingTables.length} required tables`);
    printCheck("Backup path", fs.existsSync(backupPath) ? "present" : "missing", rel(backupPath));
  }
  printCheck("SEO", monitorStatus);
  printCheck("QA", `${pass} pass, ${review} review, ${blocked} blocked`);
  if (latestRun) {
    printCheck("Latest run", `${latestRun.command} ${latestRun.status}`, latestRun.finishedAt || latestRun.startedAt);
  }
  if (latestPlanApproval) {
    printCheck("Latest approval", `${latestPlanApproval.planId} ${latestPlanApproval.approvedFor}`, latestPlanApproval.approvedAt);
  }
  if (latestPlanStatus) {
    printCheck("Latest plan status", `${latestPlanStatus.planId} ${latestPlanStatus.currentStatus}`, latestPlanStatus.lastUpdated);
  }
  if (latestInboxItem) {
    printCheck("Latest inbox item", `${latestInboxItem.title} ${latestInboxItem.status}`, latestInboxItem.createdAt);
  }
  printCheck("Deployment docs", exists("docs/PINHOLE_SERVER_DEPLOYMENT_PLAN.md") ? "present" : "missing");
  printCheck("Runtime ignore policy", notIgnored.length ? "warning" : "ready");
  console.log(`Status: ${status}`);
  console.log("Git safety: run git status --short before switching tasks.");

  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (actions.length) {
    console.log("\nAction required:");
    actions.forEach((action) => console.log(`- ${action}`));
  }

  if (critical.length) {
    console.error("\nCritical:");
    critical.forEach((item) => console.error(`- ${item}`));
    process.exitCode = 1;
  }

  safeFinishRun({ runId, command: "platform:health", status: critical.length ? "failure" : "success" });
}

main();
