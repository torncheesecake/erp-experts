import http from "node:http";
import { getOperationalSummary, getTenantState } from "./state_api.mjs";

const DEFAULT_TENANT = process.env.PLATFORM_TENANT || "erp-experts";
const HOST = process.env.SENTINEL_API_HOST || "127.0.0.1";
const PORT = Number(process.env.SENTINEL_API_PORT || 4317);

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
    headers.Vary = "Origin";
  }

  response.writeHead(statusCode, {
    ...headers,
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
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

const server = http.createServer((request, response) => {
  if (request.method !== "GET") {
    sendJson(request, response, 405, {
      error: "method_not_allowed",
      message: "Sentinel API prototype is read-only. Use GET.",
    });
    return;
  }

  const url = new URL(request.url || "/", `http://${HOST}:${PORT}`);

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
  console.log("- Local read-only prototype.");
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
