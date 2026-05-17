import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getOperationalSummary, getTenantState } from "./state_api.mjs";
import { getActivityFeed } from "../activity/activity_feed.mjs";
import { addFeedbackItem, getFeedbackOptions, listFeedbackItems, triageFeedbackItem } from "../feedback/feedback_store.mjs";
import { DEFAULT_DB_PATH, databaseExists, logRun, persistActionResult, queryRows, tableExists } from "../persistence/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const DEFAULT_TENANT = process.env.PLATFORM_TENANT || "erp-experts";
const HOST = process.env.SENTINEL_API_HOST || "127.0.0.1";
const PORT = Number(process.env.SENTINEL_API_PORT || 4317);
const ACTIONS_PATH = path.join(repoRoot, "platform/actions/actions.json");
const TENANT_REGISTRY_PATH = path.join(repoRoot, "platform/tenants/tenant-registry.json");
const MAX_OUTPUT_BYTES = 24_000;
const MAX_TIMEOUT_SECONDS = 120;
const MAX_RESULT_EXCERPT_CHARS = 1_000;
const MAX_IN_MEMORY_EXECUTIONS = 50;
const TERMINAL_EXECUTION_STATES = new Set(["success", "failed", "cancelled"]);
const actionExecutions = new Map();

function corsOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return null;

  try {
    const url = new URL(origin);
    if (["127.0.0.1", "localhost"].includes(url.hostname)) {
      return origin;
    }
  } catch {
    return null;
  }

  return null;
}

function sendJson(request, response, statusCode, payload) {
  const origin = corsOrigin(request);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers.Vary = "Origin";
  }

  response.writeHead(statusCode, {
    ...headers,
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendOptions(request, response) {
  const origin = corsOrigin(request);
  const headers = {
    "Cache-Control": "no-store",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers.Vary = "Origin";
  }
  response.writeHead(204, headers);
  response.end();
}

function tenantFromUrl(url) {
  return url.searchParams.get("tenant") || DEFAULT_TENANT;
}

function tenantSummary(tenant) {
  return {
    tenantId: tenant.tenantId,
    name: tenant.name,
    brandName: tenant.brandName,
    domain: tenant.domain,
    baseUrl: tenant.baseUrl,
    dashboardRoute: tenant.dashboardRoute,
    reportOutputPath: tenant.reportOutputPath,
    servicePaths: tenant.servicePaths,
    contactPaths: tenant.contactPaths,
  };
}

function isLocalRequest(request) {
  const remoteAddress = request.socket?.remoteAddress || "";
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress);
}

function quoteSql(value) {
  return String(value ?? "").replaceAll("'", "''");
}

function actionHistoryLimit(url) {
  const parsed = Number(url.searchParams.get("limit") || 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(Math.floor(parsed), 50);
}

function durationMsBetween(startedAt, finishedAt) {
  const start = startedAt ? new Date(startedAt).getTime() : 0;
  const end = finishedAt ? new Date(finishedAt).getTime() : 0;
  if (!start || !end || Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, end - start);
}

function durationLabel(durationMs) {
  const duration = Number(durationMs || 0);
  if (!Number.isFinite(duration) || duration <= 0) return "";
  if (duration < 1000) return `${Math.round(duration)}ms`;
  if (duration < 60_000) return `${Math.round(duration / 1000)}s`;
  const minutes = Math.floor(duration / 60_000);
  const seconds = Math.round((duration % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function activityLimit(url) {
  const parsed = Number(url.searchParams.get("limit") || 20);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20;
  return Math.min(Math.floor(parsed), 100);
}

function feedbackLimit(url) {
  const parsed = Number(url.searchParams.get("limit") || 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 10;
  return Math.min(Math.floor(parsed), 50);
}

function loadActionRegistry() {
  const registry = JSON.parse(fs.readFileSync(ACTIONS_PATH, "utf8"));
  return Array.isArray(registry.actions) ? registry.actions : [];
}

function loadTenantRegistry() {
  const registry = JSON.parse(fs.readFileSync(TENANT_REGISTRY_PATH, "utf8"));
  return {
    defaultTenantId: registry.defaultTenantId || DEFAULT_TENANT,
    tenants: Array.isArray(registry.tenants) ? registry.tenants : [],
  };
}

function actionById(actionId) {
  return loadActionRegistry().find((action) => action.id === actionId) || null;
}

function npmScriptFromAction(action) {
  const match = String(action.command || "").match(/^npm run ([a-z0-9:_-]+)$/i);
  if (!match) {
    throw new Error(`Action ${action.id} does not use a supported npm script command.`);
  }
  return match[1];
}

function readJsonBody(request, maxBytes = 4096) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > maxBytes) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function appendLimited(current, chunk) {
  const next = `${current}${chunk}`;
  if (Buffer.byteLength(next, "utf8") <= MAX_OUTPUT_BYTES) return { value: next, truncated: false };
  return {
    value: next.slice(0, MAX_OUTPUT_BYTES),
    truncated: true,
  };
}

function redactSensitiveOutput(value = "") {
  return String(value)
    .replace(/((?:password|passwd|token|secret|api[_-]?key|ftp[_-]?pass|basic_auth_password)\w*\s*[:=]\s*)[^\s'"]+/gi, "$1[redacted]")
    .replace(/((?:PASSWORD|PASS|TOKEN|SECRET|API_KEY|FTP_PASS|BASIC_AUTH_PASSWORD)\w*\s*=\s*)[^\s'"]+/g, "$1[redacted]");
}

function meaningfulOutputLines(value = "") {
  return redactSensitiveOutput(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("> "))
    .filter((line) => !line.startsWith("npm "))
    .filter((line) => !line.includes("@0.0.0 "));
}

function summariseActionOutput({ status, exitCode, stdout = "", stderr = "" }) {
  const stdoutLines = meaningfulOutputLines(stdout);
  const stderrLines = meaningfulOutputLines(stderr);

  if (status !== "success") {
    return stderrLines[0] || stdoutLines.find((line) => /error|failed|warning/i.test(line)) || `Action failed with exit code ${exitCode}.`;
  }

  const healthLine = stdoutLines.find((line) => /^(Health|Status|SEO):/i.test(line));
  const qaLine = stdoutLines.find((line) => /^QA:/i.test(line) || /^pass=\d+/i.test(line));
  if (healthLine && qaLine) return `${healthLine}; ${qaLine}`;
  if (healthLine) return healthLine;
  if (qaLine) return qaLine;

  const overallLine = stdoutLines.find((line) => /^Overall:/i.test(line));
  if (overallLine) return overallLine;

  const generatedLine = stdoutLines.find((line) => /^Generated:/i.test(line));
  if (generatedLine) return generatedLine;

  return stdoutLines[0] || "Action completed successfully.";
}

function actionOutputExcerpt({ stdout = "", stderr = "" }) {
  const combined = redactSensitiveOutput([stdout, stderr].filter(Boolean).join("\n\n")).trim();
  if (!combined) return "";
  return combined.slice(0, MAX_RESULT_EXCERPT_CHARS);
}

function actionStderrExcerpt(stderr = "") {
  const value = redactSensitiveOutput(stderr).trim();
  if (!value) return "";
  return value.slice(0, MAX_RESULT_EXCERPT_CHARS);
}

function persistOperatorActionResult({ tenantId, action, status, startedAt, finishedAt, summary, outputExcerpt }) {
  if (!databaseExists(DEFAULT_DB_PATH)) return null;

  try {
    const runId = logRun({
      tenantId,
      command: `ui_action:${action.id}`,
      status,
      startedAt,
      finishedAt,
    });

    persistActionResult({
      runId,
      tenantId,
      actionId: action.id,
      status,
      summary,
      outputExcerpt,
      createdAt: finishedAt,
    });

    return runId;
  } catch (error) {
    console.warn(`[sentinel-action] SQLite action result warning: ${error.message}`);
    return null;
  }
}

function executionDurationMs(execution) {
  const start = execution.startedAt ? new Date(execution.startedAt).getTime() : 0;
  const end = execution.finishedAt ? new Date(execution.finishedAt).getTime() : Date.now();
  if (!start || Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, end - start);
}

function publicExecution(execution) {
  const durationMs = executionDurationMs(execution);
  const isFailure = execution.status === "failed" || execution.status === "failure";
  return {
    executionId: execution.executionId,
    status: execution.status,
    action: execution.actionId,
    label: execution.label,
    command: execution.command,
    tenantId: execution.tenantId,
    summary: execution.summary || "",
    outputExcerpt: execution.outputExcerpt || "",
    outputTruncated: Boolean(execution.outputTruncated),
    queuedAt: execution.queuedAt,
    startedAt: execution.startedAt || "",
    finishedAt: execution.finishedAt || "",
    updatedAt: execution.updatedAt || execution.queuedAt,
    durationMs,
    durationLabel: durationLabel(durationMs),
    exitCode: execution.exitCode,
    signal: execution.signal || "",
    timedOut: Boolean(execution.timedOut),
    runId: execution.runId || null,
    stderrExcerpt: actionStderrExcerpt(execution.stderr),
    failureSuggestion: isFailure ? "Check platform:doctor, then review the output excerpt." : "",
  };
}

function rememberExecution(execution) {
  actionExecutions.set(execution.executionId, execution);
  if (actionExecutions.size <= MAX_IN_MEMORY_EXECUTIONS) return;

  const removable = [...actionExecutions.values()]
    .filter((item) => TERMINAL_EXECUTION_STATES.has(item.status))
    .sort((a, b) => String(a.updatedAt || a.queuedAt).localeCompare(String(b.updatedAt || b.queuedAt)));

  const [oldest] = removable;
  if (oldest) actionExecutions.delete(oldest.executionId);
}

function updateExecutionOutput(execution) {
  execution.outputExcerpt = actionOutputExcerpt({
    stdout: execution.stdout,
    stderr: execution.stderr,
  });
  execution.updatedAt = new Date().toISOString();
}

function finishExecution(execution, payload) {
  if (TERMINAL_EXECUTION_STATES.has(execution.status)) return;

  const finishedAt = payload.finishedAt || new Date().toISOString();
  const summary = summariseActionOutput(payload);
  const outputExcerpt = actionOutputExcerpt(payload);
  const runId = persistOperatorActionResult({
    tenantId: execution.tenantId,
    action: {
      id: execution.actionId,
      label: execution.label,
      command: execution.command,
    },
    status: payload.status,
    startedAt: execution.startedAt,
    finishedAt,
    summary,
    outputExcerpt,
  });

  Object.assign(execution, {
    ...payload,
    status: payload.status,
    summary,
    outputExcerpt,
    runId,
    finishedAt,
    updatedAt: finishedAt,
  });

  rememberExecution(execution);
}

function startQueuedActionExecution(executionId) {
  const execution = actionExecutions.get(executionId);
  if (!execution || execution.status !== "queued") return;

  const timeoutSeconds = Math.min(Number(execution.timeoutSeconds || 30), MAX_TIMEOUT_SECONDS);
  execution.status = "running";
  execution.startedAt = new Date().toISOString();
  execution.updatedAt = execution.startedAt;
  execution.summary = "Action is running.";
  rememberExecution(execution);

  console.log(`[sentinel-action] starting ${execution.actionId} (${execution.command}) execution=${execution.executionId}`);

  let settled = false;
  let timer;
  const child = spawn("npm", ["run", execution.script], {
    cwd: repoRoot,
    shell: false,
    env: {
      ...process.env,
      PLATFORM_TENANT: execution.tenantId,
    },
  });

  const finish = (payload) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    finishExecution(execution, payload);
  };

  timer = setTimeout(() => {
    execution.timedOut = true;
    child.kill("SIGTERM");
  }, timeoutSeconds * 1000);

  child.stdout.on("data", (chunk) => {
    const result = appendLimited(execution.stdout, chunk.toString());
    execution.stdout = result.value;
    execution.outputTruncated = execution.outputTruncated || result.truncated;
    updateExecutionOutput(execution);
  });

  child.stderr.on("data", (chunk) => {
    const result = appendLimited(execution.stderr, chunk.toString());
    execution.stderr = result.value;
    execution.outputTruncated = execution.outputTruncated || result.truncated;
    updateExecutionOutput(execution);
  });

  child.on("error", (error) => {
    const finishedAt = new Date().toISOString();
    console.warn(`[sentinel-action] failed ${execution.actionId}: ${error.message}`);
    finish({
      status: "failed",
      exitCode: 1,
      stdout: execution.stdout,
      stderr: execution.stderr || error.message,
      timedOut: Boolean(execution.timedOut),
      outputTruncated: Boolean(execution.outputTruncated),
      startedAt: execution.startedAt,
      finishedAt,
    });
  });

  child.on("close", (code, signal) => {
    const finishedAt = new Date().toISOString();
    const status = code === 0 && !execution.timedOut ? "success" : "failed";
    console.log(`[sentinel-action] finished ${execution.actionId} ${status} execution=${execution.executionId}`);
    finish({
      status,
      exitCode: execution.timedOut ? 124 : code ?? 1,
      signal,
      stdout: execution.stdout,
      stderr: execution.timedOut ? `${execution.stderr}\nAction timed out after ${timeoutSeconds}s.`.trim() : execution.stderr,
      timedOut: Boolean(execution.timedOut),
      outputTruncated: Boolean(execution.outputTruncated),
      startedAt: execution.startedAt,
      finishedAt,
    });
  });
}

function enqueueActionExecution(action, tenantId) {
  const script = npmScriptFromAction(action);
  const queuedAt = new Date().toISOString();
  const execution = {
    executionId: randomUUID(),
    actionId: action.id,
    label: action.label,
    command: action.command,
    tenantId,
    script,
    timeoutSeconds: action.timeoutSeconds,
    status: "queued",
    summary: "Action queued.",
    stdout: "",
    stderr: "",
    outputExcerpt: "",
    outputTruncated: false,
    queuedAt,
    startedAt: "",
    finishedAt: "",
    updatedAt: queuedAt,
    exitCode: null,
    signal: "",
    timedOut: false,
    runId: null,
  };

  rememberExecution(execution);
  setImmediate(() => startQueuedActionExecution(execution.executionId));
  return execution;
}

function handleError(request, response, error) {
  if (error.code === "TENANT_CONFIG_ERROR") {
    sendJson(request, response, 404, {
      error: "unknown_tenant",
      message: error.message,
      details: error.details || [],
    });
    return;
  }

  sendJson(request, response, 500, {
    error: "sentinel_api_error",
    message: error.message,
  });
}

async function handleAction(request, response, url) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Operator actions are available only from localhost.",
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    sendJson(request, response, 400, {
      error: "invalid_request",
      message: error.message,
    });
    return;
  }

  const actionId = body.actionId || body.id || "";
  const tenantId = body.tenant || tenantFromUrl(url);
  const action = actionById(actionId);

  if (!action) {
    sendJson(request, response, 404, {
      error: "unknown_action",
      message: `Unknown operator action: ${actionId}`,
    });
    return;
  }

  if (!action.allowFromUI) {
    sendJson(request, response, 403, {
      error: "action_not_allowed",
      message: `Action ${actionId} is not allowed from the operator UI.`,
    });
    return;
  }

  try {
    getTenantState(tenantId);
    const execution = enqueueActionExecution(action, tenantId);
    sendJson(request, response, 202, publicExecution(execution));
  } catch (error) {
    handleError(request, response, error);
  }
}

function handleActionExecution(request, response, executionId) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Operator action execution state is available only from localhost.",
    });
    return;
  }

  const execution = actionExecutions.get(executionId);
  if (!execution) {
    sendJson(request, response, 404, {
      error: "unknown_execution",
      message: `Unknown operator action execution: ${executionId}`,
    });
    return;
  }

  sendJson(request, response, 200, publicExecution(execution));
}

function loadActionHistory({ tenantId, limit }) {
  if (!databaseExists(DEFAULT_DB_PATH) || !tableExists("runs", DEFAULT_DB_PATH)) return [];
  const hasActionResults = tableExists("action_results", DEFAULT_DB_PATH);
  const resultSelect = hasActionResults
    ? "replace(COALESCE(ar.summary, ''), char(9), ' '), replace(replace(replace(COALESCE(ar.output_excerpt, ''), char(9), '  '), char(13), ''), char(10), '\\n')"
    : "'', ''";
  const resultJoin = hasActionResults
    ? "LEFT JOIN action_results ar ON ar.run_id = r.id"
    : "";

  return queryRows(
    `SELECT r.id, r.command, r.status, COALESCE(r.started_at, ''), COALESCE(r.finished_at, ''), ${resultSelect}
     FROM runs r
     ${resultJoin}
     WHERE r.tenant_id = '${quoteSql(tenantId)}'
       AND r.command LIKE 'ui_action:%'
     ORDER BY COALESCE(r.finished_at, r.started_at) DESC, r.id DESC
     LIMIT ${Number(limit) || 10};`,
    DEFAULT_DB_PATH,
  ).map(([id, command, status, startedAt, finishedAt, summary, outputExcerpt]) => {
    const durationMs = durationMsBetween(startedAt, finishedAt);
    const isFailure = status === "failed" || status === "failure";
    return {
      id: Number(id),
      action: String(command || "").replace(/^ui_action:/, ""),
      status,
      startedAt,
      finishedAt,
      durationMs,
      durationLabel: durationLabel(durationMs),
      summary,
      outputExcerpt: String(outputExcerpt || "").replaceAll("\\n", "\n"),
      failureSuggestion: isFailure ? "Check platform:doctor, then review the output excerpt." : "",
    };
  });
}

function handleActionHistory(request, response, url) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Operator action history is available only from localhost.",
    });
    return;
  }

  const tenantId = tenantFromUrl(url);
  try {
    getTenantState(tenantId);
    sendJson(request, response, 200, {
      actions: loadActionHistory({
        tenantId,
        limit: actionHistoryLimit(url),
      }),
    });
  } catch (error) {
    handleError(request, response, error);
  }
}

function handleTenants(request, response) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Tenant registry is available only from localhost.",
    });
    return;
  }

  sendJson(request, response, 200, loadTenantRegistry());
}

function handleActivity(request, response, url) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Sentinel activity feed is available only from localhost.",
    });
    return;
  }

  const tenantId = tenantFromUrl(url);
  try {
    getTenantState(tenantId);
    sendJson(request, response, 200, {
      tenantId,
      activities: getActivityFeed({
        tenantId,
        limit: activityLimit(url),
      }),
    });
  } catch (error) {
    handleError(request, response, error);
  }
}

function handleFeedbackList(request, response, url) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Operator feedback is available only from localhost.",
    });
    return;
  }

  sendJson(request, response, 200, {
    items: listFeedbackItems({
      category: url.searchParams.get("category") || "",
      section: url.searchParams.get("section") || "",
      status: url.searchParams.get("status") || "",
      priority: url.searchParams.get("priority") || "",
      effort: url.searchParams.get("effort") || "",
      triageStatus: url.searchParams.get("triageStatus") || "",
      limit: feedbackLimit(url),
    }),
    options: getFeedbackOptions(),
  });
}

async function handleFeedbackAdd(request, response) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Operator feedback can only be captured from localhost.",
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
    const item = addFeedbackItem({
      category: body.category,
      section: body.section,
      summary: body.summary,
      status: body.status || "new",
      priority: body.priority || "medium",
      effort: body.effort || "medium",
      triageStatus: body.triageStatus || "new",
      owner: body.owner || "",
      linkedCommand: body.linkedCommand || "",
      linkedSection: body.linkedSection || "",
    });
    sendJson(request, response, 201, { item });
  } catch (error) {
    sendJson(request, response, error.code === "FEEDBACK_VALIDATION_ERROR" ? 400 : 500, {
      error: error.code || "feedback_error",
      message: error.message,
    });
  }
}

async function handleFeedbackTriage(request, response) {
  if (!isLocalRequest(request)) {
    sendJson(request, response, 403, {
      error: "local_only",
      message: "Operator feedback triage can only be captured from localhost.",
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const item = triageFeedbackItem({
      id: body.id,
      priority: body.priority,
      effort: body.effort,
      triageStatus: body.triageStatus,
      owner: body.owner,
      linkedCommand: body.linkedCommand,
      linkedSection: body.linkedSection,
      note: body.note,
    });
    sendJson(request, response, 200, { item });
  } catch (error) {
    const status = error.code === "FEEDBACK_NOT_FOUND" ? 404 : error.code === "FEEDBACK_VALIDATION_ERROR" ? 400 : 500;
    sendJson(request, response, status, {
      error: error.code || "feedback_triage_error",
      message: error.message,
    });
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendOptions(request, response);
    return;
  }

  if (!["GET", "POST"].includes(request.method)) {
    sendJson(request, response, 405, {
      error: "method_not_allowed",
      message: "Unsupported method.",
    });
    return;
  }

  const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);

  if (request.method === "POST") {
    if (url.pathname === "/action") {
      await handleAction(request, response, url);
      return;
    }

    if (url.pathname === "/feedback/triage") {
      await handleFeedbackTriage(request, response);
      return;
    }

    if (url.pathname === "/feedback") {
      await handleFeedbackAdd(request, response);
      return;
    }

    sendJson(request, response, 404, {
      error: "not_found",
      message: `Unknown endpoint: ${url.pathname}`,
    });
    return;
  }

  try {
    if (url.pathname === "/health") {
      sendJson(request, response, 200, {
        status: "ok",
        service: "sentinel-api",
      });
      return;
    }

    if (url.pathname === "/state") {
      sendJson(request, response, 200, getOperationalSummary(tenantFromUrl(url)));
      return;
    }

    if (url.pathname === "/tenant") {
      sendJson(request, response, 200, tenantSummary(getTenantState(tenantFromUrl(url))));
      return;
    }

    if (url.pathname === "/tenants") {
      handleTenants(request, response);
      return;
    }

    if (url.pathname === "/actions/history") {
      handleActionHistory(request, response, url);
      return;
    }

    if (url.pathname.startsWith("/actions/execution/")) {
      const executionId = decodeURIComponent(url.pathname.replace("/actions/execution/", ""));
      handleActionExecution(request, response, executionId);
      return;
    }

    if (url.pathname === "/activity") {
      handleActivity(request, response, url);
      return;
    }

    if (url.pathname === "/feedback") {
      handleFeedbackList(request, response, url);
      return;
    }

    sendJson(request, response, 404, {
      error: "not_found",
      message: `Unknown endpoint: ${url.pathname}`,
    });
  } catch (error) {
    handleError(request, response, error);
  }
});

server.listen(PORT, HOST, () => {
  console.log("Sentinel local HTTP API prototype");
  console.log("");
  console.log("Safety:");
  console.log("- Local-only API prototype.");
  console.log("- /action uses a strict allowlist and fixed npm scripts only.");
  console.log("- /actions/execution/<id> exposes lifecycle polling for started executions.");
  console.log("- No arbitrary shell input, deploy commands or destructive actions are exposed.");
  console.log("- No authentication is implemented yet.");
  console.log("- Do not expose this API publicly.");
  console.log("");
  console.log(`Listening: http://${HOST}:${PORT}`);
  console.log(`Default tenant: ${DEFAULT_TENANT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
