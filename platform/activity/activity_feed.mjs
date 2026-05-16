import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_DB_PATH, databaseExists, queryRows, tableExists } from "../persistence/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const DEFAULT_TENANT = "erp-experts";
const TAXONOMY_PATH = path.join(__dirname, "activity-taxonomy.json");

export function getActivityTaxonomy() {
  return JSON.parse(fs.readFileSync(TAXONOMY_PATH, "utf8"));
}

function quoteSql(value) {
  return String(value ?? "").replaceAll("'", "''");
}

function safeLimit(limit, fallback = 20) {
  const parsed = Number(limit || fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), 100);
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

function fileTimestamp(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  try {
    if (!fs.existsSync(filePath)) return "";
    return fs.statSync(filePath).mtime.toISOString();
  } catch {
    return "";
  }
}

function parseTimestamp(value = "") {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  if (!Number.isNaN(parsed)) return parsed;

  // SQLite datetime('now') values are local-looking UTC strings without a T.
  const sqliteParsed = new Date(`${String(value).replace(" ", "T")}Z`).getTime();
  return Number.isNaN(sqliteParsed) ? 0 : sqliteParsed;
}

function severityFromStatus(status = "") {
  const normalised = String(status || "").toLowerCase();
  if (["success", "passed", "pass", "healthy"].includes(normalised)) return "success";
  if (["running", "warning", "ready with warnings"].includes(normalised)) return "warning";
  if (["failure", "failed", "error", "blocked", "not ready"].includes(normalised)) return "error";
  return "info";
}

function normaliseActivityType(type = "", taxonomy = getActivityTaxonomy()) {
  const normalised = String(type || "").trim().toLowerCase();
  if (taxonomy.types?.[normalised]) return normalised;
  if (normalised === "notifications") return "notification";
  if (["monitor", "autopilot", "reports"].includes(normalised)) return "system";
  return "system";
}

function normaliseActivitySeverity(severity = "", taxonomy = getActivityTaxonomy()) {
  const normalised = String(severity || "").trim().toLowerCase();
  return taxonomy.severities?.[normalised] ? normalised : "info";
}

export function normaliseActivityEntry(entry, taxonomy = getActivityTaxonomy()) {
  const type = normaliseActivityType(entry?.type, taxonomy);
  const severity = normaliseActivitySeverity(entry?.severity || taxonomy.types?.[type]?.defaultSeverity, taxonomy);
  const typeMeta = taxonomy.types?.[type] || taxonomy.types.system;
  const severityMeta = taxonomy.severities?.[severity] || taxonomy.severities.info;

  return {
    ...entry,
    type,
    severity,
    displayLabel: typeMeta?.label || "System",
    visualHint: typeMeta?.visualHint || severityMeta?.visualHint || "slate",
  };
}

function statusWord(status = "") {
  if (status === "success") return "completed successfully";
  if (status === "running") return "is running";
  if (status === "failure") return "failed";
  return status || "completed";
}

function commandType(command = "") {
  if (command.startsWith("ui_action:")) return "operator";
  if (command.includes("platform:cadence")) return "cadence";
  if (command.includes("platform:notify")) return "notification";
  if (command.includes("platform:deploy:ready") || command.includes("deploy:")) return "deploy";
  if (command.includes("backup:")) return "backup";
  if (command.includes("platform:tenant")) return "tenant";
  if (command.includes("platform:api")) return "api";
  if (command.includes("seo:monitor") || command.includes("platform:health") || command.includes("platform:doctor")) return "health";
  return "system";
}

function commandTitle(command = "", status = "") {
  const suffix = statusWord(status);
  if (command.startsWith("ui_action:")) {
    return `Operator ran ${command.replace(/^ui_action:/, "")}`;
  }
  if (command === "seo:monitor") return `SEO monitor ${suffix}`;
  if (command === "seo:autopilot") return `Autopilot ${suffix}`;
  if (command === "platform:cadence") return `Cadence ${suffix}`;
  if (command === "platform:notify") return `Notification payloads ${suffix}`;
  if (command === "platform:deploy:ready") return `Deployment readiness ${suffix}`;
  if (command === "platform:start") return `Operator startup ${suffix}`;
  if (command === "platform:doctor") return `Doctor diagnostic ${suffix}`;
  if (command === "platform:daily") return `Daily operator report ${suffix}`;
  if (command === "platform:stakeholder") return `Stakeholder report ${suffix}`;
  if (command === "platform:state") return `Sentinel state refresh ${suffix}`;
  return `${command || "Sentinel task"} ${suffix}`;
}

function commandSummary(command = "", status = "", actionSummary = "") {
  if (actionSummary) return actionSummary;
  if (command.startsWith("ui_action:")) {
    return `Controlled operator action ${statusWord(status)}.`;
  }
  if (command === "seo:monitor") return `SEO health check ${statusWord(status)}.`;
  if (command === "seo:autopilot") return `Autopilot orchestration ${statusWord(status)}.`;
  if (command === "platform:cadence") return `Scheduled local cadence ${statusWord(status)}.`;
  if (command === "platform:notify") return `Notification payload generation ${statusWord(status)}. No messages sent.`;
  if (command === "platform:deploy:ready") return `Deployment readiness gate ${statusWord(status)}.`;
  return `Sentinel command ${statusWord(status)}.`;
}

function runActivities({ tenantId = DEFAULT_TENANT, limit = 80, dbPath = DEFAULT_DB_PATH } = {}) {
  if (!databaseExists(dbPath) || !tableExists("runs", dbPath)) return [];
  const hasActionResults = tableExists("action_results", dbPath);
  const join = hasActionResults ? "LEFT JOIN action_results ar ON ar.run_id = r.id" : "";
  const actionSelect = hasActionResults ? "replace(COALESCE(ar.summary, ''), char(9), ' ')" : "''";

  return queryRows(
    `SELECT r.id, r.tenant_id, r.command, r.status, COALESCE(r.started_at, ''), COALESCE(r.finished_at, ''), ${actionSelect}
     FROM runs r
     ${join}
     WHERE r.tenant_id = '${quoteSql(tenantId)}'
     ORDER BY r.id DESC
     LIMIT ${safeLimit(limit, 80)};`,
    dbPath,
  ).map(([id, rowTenantId, command, status, startedAt, finishedAt, actionSummary]) => {
    const timestamp = finishedAt || startedAt;
    const type = commandType(command);
    return {
      id: `run-${id}`,
      type,
      title: commandTitle(command, status),
      summary: commandSummary(command, status, actionSummary),
      severity: severityFromStatus(status),
      timestamp,
      source: type === "operator" ? "ui_action" : "runs",
      relatedEntity: {
        tenantId: rowTenantId,
        runId: Number(id),
        command,
        status,
      },
    };
  });
}

function cadenceActivity() {
  const cadence = readJsonIfPresent("reports/sentinel-cadence-summary.json");
  if (!cadence?.ranAt) return [];
  const tasks = Array.isArray(cadence.tasksRun) ? cadence.tasksRun : [];
  const failedTasks = tasks.filter((task) => task.status && task.status !== "success");
  const reportsGenerated = Array.isArray(cadence.generatedReports) ? cadence.generatedReports.length : 0;
  return [{
    id: `cadence-${cadence.ranAt}`,
    type: "cadence",
    title: failedTasks.length ? "Cadence completed with warnings" : "Cadence completed",
    summary: `${tasks.length || 0} tasks run, ${reportsGenerated} reports generated, notifications ${cadence.notificationsGenerated ? "prepared" : "not prepared"}.`,
    severity: failedTasks.length ? "warning" : "success",
    timestamp: cadence.ranAt,
    source: "cadence_summary",
    relatedEntity: {
      mode: cadence.mode || "unknown",
      workflow: cadence.workflow || "unknown",
      stakeholderSafetyStatus: cadence.stakeholderSafetyStatus || "not recorded",
    },
  }];
}

function notificationActivity() {
  const notificationDir = path.join(repoRoot, "reports/notifications");
  if (!fs.existsSync(notificationDir)) return [];

  const expected = [
    "operator-notification.md",
    "operator-notification.json",
    "stakeholder-notification.md",
    "stakeholder-notification.json",
  ];
  const existing = expected
    .map((file) => {
      const fullPath = path.join(notificationDir, file);
      if (!fs.existsSync(fullPath)) return null;
      const stat = fs.statSync(fullPath);
      return { file, mtime: stat.mtime.toISOString() };
    })
    .filter(Boolean);

  if (!existing.length) return [];
  const latest = existing.sort((a, b) => parseTimestamp(b.mtime) - parseTimestamp(a.mtime))[0];
  const stakeholderPresent = existing.some((item) => item.file.startsWith("stakeholder-"));
  const operatorPresent = existing.some((item) => item.file.startsWith("operator-"));

  return [{
    id: `notifications-${latest.mtime}`,
    type: "notification",
    title: "Notification payloads generated",
    summary: `${operatorPresent ? "Operator" : "No operator"} and ${stakeholderPresent ? "stakeholder" : "no stakeholder"} payloads are present. No messages sent.`,
    severity: "success",
    timestamp: latest.mtime,
    source: "notification_payloads",
    relatedEntity: {
      operatorPayload: operatorPresent,
      stakeholderPayload: stakeholderPresent,
    },
  }];
}

function reportActivities() {
  const reports = [
    {
      id: "daily-operator-report",
      type: "system",
      title: "Daily operator report generated",
      summary: "Private operator handoff report is available locally.",
      source: "operator_report",
      path: "reports/sentinel-daily-operator-report.md",
    },
    {
      id: "stakeholder-weekly-report",
      type: "system",
      title: "Stakeholder progress report generated",
      summary: "Stakeholder-safe SEO and content progress summary is available locally.",
      source: "stakeholder_report",
      path: "reports/sentinel-stakeholder-weekly-report.md",
    },
    {
      id: "deploy-readiness",
      type: "deploy",
      title: "Deployment readiness check completed",
      summary: "Readiness gate output is available locally.",
      source: "deploy_readiness",
      path: "reports/sentinel-deploy-readiness.json",
    },
  ];

  return reports.flatMap((item) => {
    const timestamp = fileTimestamp(item.path);
    if (!timestamp) return [];
    const readiness = item.source === "deploy_readiness" ? readJsonIfPresent(item.path) : null;
    return [{
      id: `${item.id}-${timestamp}`,
      type: item.type,
      title: item.title,
      summary: readiness?.overallStatus ? `Readiness status: ${readiness.overallStatus}.` : item.summary,
      severity: readiness?.overallStatus === "NOT READY" ? "error" : readiness?.overallStatus === "READY WITH WARNINGS" ? "warning" : "success",
      timestamp,
      source: item.source,
      relatedEntity: readiness?.overallStatus ? { overallStatus: readiness.overallStatus } : {},
    }];
  });
}

export function getActivityFeed({ tenantId = DEFAULT_TENANT, limit = 20, dbPath = DEFAULT_DB_PATH } = {}) {
  const requestedLimit = safeLimit(limit, 20);
  const taxonomy = getActivityTaxonomy();
  const entries = [
    ...runActivities({ tenantId, limit: Math.max(requestedLimit * 4, 80), dbPath }),
    ...cadenceActivity(),
    ...notificationActivity(),
    ...reportActivities(),
  ];

  return entries
    .filter((entry) => entry.timestamp)
    .sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp))
    .map((entry) => normaliseActivityEntry(entry, taxonomy))
    .slice(0, requestedLimit);
}
