import http from "node:http";

const HOST = process.env.SENTINEL_API_HOST || "127.0.0.1";
const PORT = Number(process.env.SENTINEL_API_PORT || 4317);
const BASE_URL = `http://${HOST}:${PORT}`;

function getJson(pathname) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${BASE_URL}${pathname}`, { timeout: 5000 }, (response) => {
      let body = "";

      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        let payload = null;
        try {
          payload = JSON.parse(body);
        } catch {
          reject(new Error(`${pathname} returned non-JSON response`));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`${pathname} returned ${response.statusCode}: ${payload.message || payload.error || "request failed"}`));
          return;
        }

        resolve(payload);
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error(`${pathname} timed out`));
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function fail(error) {
  console.error("Sentinel API Smoke Test");
  console.error("");
  console.error("Status: failed");
  console.error(`Target: ${BASE_URL}`);
  console.error(`Reason: ${error.message}`);
  console.error("");
  console.error("Start the local API server first:");
  console.error("npm run platform:api:serve");
  process.exit(1);
}

async function main() {
  try {
    const health = await getJson("/health");
    const state = await getJson("/state");

    if (health.status !== "ok" || health.service !== "sentinel-api") {
      throw new Error("/health did not return expected Sentinel API status");
    }

    if (!state.tenant?.tenantId || !state.health?.monitorStatus) {
      throw new Error("/state did not return an operational Sentinel state payload");
    }

    console.log("Sentinel API Smoke Test");
    console.log("");
    console.log(`Target: ${BASE_URL}`);
    console.log(`Health: ${health.status}`);
    console.log(`Tenant: ${state.tenant.name} (${state.tenant.tenantId})`);
    console.log(`SEO: ${state.health.monitorStatus}`);
    console.log(`QA: ${state.health.pass}/${state.health.review}/${state.health.blocked}`);
    console.log("Status: passed");
  } catch (error) {
    fail(error);
  }
}

main();
