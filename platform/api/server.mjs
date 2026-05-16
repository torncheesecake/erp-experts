import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getOperationalSummary, getTenantState } from "./state_api.mjs";
import { DEFAULT_DB_PATH, databaseExists, queryRows, tableExists } from "../persistence/db.js";
import { safeLogRun } from "../../scripts/platform/run_logger.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const DEFAULT_TENANT = process.env.PLATFORM_TENANT || "erp-experts";
const HOST = process.env.SENTINEL_API_HOST || "127.0.0.1";
const PORT = Number(process.env.SENTINEL_API_PORT || 4317);
const ACTIONS_PATH = path.join(repoRoot, "platform/actions/actions.json");
const MAX_OUTPUT_BYTES = 24_000;
const MAX_TIMEOUT_SECONDS = 120;

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

function loadActionRegistry() {
  const registry = JSON.parse(fs.readFileSync(ACTIONS_PATH, "utf8"));
  return Array.isArray(registry.actions) ? registry.actions : [];
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

function runAllowedAction(action, tenantId) {
  const script = npmScriptFromAction(action);
  const timeoutSeconds = Math.min(Number(action.timeoutSeconds || 30), MAX_TIMEOUT_SECONDS);
  const startedAt = new Date().toISOString();

  console.log(`[sentinel-action] starting ${action.id} (${action.command})`);

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let outputTruncated = false;
    let timedOut = false;
    let settled = false;
    let timer;
    const child = spawn("npm", ["run", script], {
      cwd: repoRoot,
      shell: false,
      env: {
        ...process.env,
        PLATFORM_TENANT: tenantId,
      },
    });

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(payload);
    };

    timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutSeconds * 1000);

    child.stdout.on("data", (chunk) => {
      const result = appendLimited(stdout, chunk.toString());
      stdout = result.value;
      outputTruncated = outputTruncated || result.truncated;
    });

    child.stderr.on("data", (chunk) => {
      const result = appendLimited(stderr, chunk.toString());
      stderr = result.value;
      outputTruncated = outputTruncated || result.truncated;
    });

    child.on("error", (error) => {
      const finishedAt = new Date().toISOString();
      safeLogRun({
        tenantId,
        command: `ui_action:${action.id}`,
        status: "failure",
        startedAt,
        finishedAt,
      });
      console.warn(`[sentinel-action] failed ${action.id}: ${error.message}`);
      finish({
        status: "failure",
        action: action.id,
        label: action.label,
        command: action.command,
        exitCode: 1,
        stdout,
        stderr: stderr || error.message,
        timedOut,
        outputTruncated,
        startedAt,
        finishedAt,
      });
    });

    child.on("close", (code, signal) => {
      const finishedAt = new Date().toISOString();
      const status = code === 0 && !timedOut ? "success" : "failure";
      safeLogRun({
        tenantId,
        command: `ui_action:${action.id}`,
        status,
        startedAt,
        finishedAt,
      });
      console.log(`[sentinel-action] finished ${action.id} ${status}`);
      finish({
        status,
        action: action.id,
        label: action.label,
        command: action.command,
        exitCode: timedOut ? 124 : code ?? 1,
        signal,
        stdout,
        stderr: timedOut ? `${stderr}\nAction timed out after ${timeoutSeconds}s.`.trim() : stderr,
        timedOut,
        outputTruncated,
        startedAt,
        finishedAt,
      });
    });
  });
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
    const result = await runAllowedAction(action, tenantId);
    sendJson(request, response, result.status === "success" ? 200 : 500, result);
  } catch (error) {
    handleError(request, response, error);
  }
}

function loadActionHistory({ tenantId, limit }) {
  if (!databaseExists(DEFAULT_DB_PATH) || !tableExists("runs", DEFAULT_DB_PATH)) return [];

  return queryRows(
    `SELECT id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
     FROM runs
     WHERE tenant_id = '${quoteSql(tenantId)}'
       AND command LIKE 'ui_action:%'
     ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
     LIMIT ${Number(limit) || 10};`,
    DEFAULT_DB_PATH,
  ).map(([id, command, status, startedAt, finishedAt]) => ({
    id: Number(id),
    action: String(command || "").replace(/^ui_action:/, ""),
    status,
    startedAt,
    finishedAt,
  }));
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

    if (url.pathname === "/actions/history") {
      handleActionHistory(request, response, url);
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
