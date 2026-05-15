import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const apiHost = process.env.SENTINEL_API_HOST || "127.0.0.1";
const apiPort = Number(process.env.SENTINEL_API_PORT || 4317);
const apiUrl = `http://${apiHost}:${apiPort}`;
const tenantId = getArgValue("--tenant", process.env.PLATFORM_TENANT || "erp-experts");
const withApi = process.argv.includes("--with-api");
let apiChild = null;

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function runNpm(script) {
  const result = spawnSync("npm", ["run", script], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });

  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function firstMatchingLine(output, patterns) {
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => patterns.some((pattern) => pattern.test(line))) || "";
}

function checkApiHealth(timeoutMs = 1000) {
  return new Promise((resolve) => {
    const request = http.get(`${apiUrl}/health`, { timeout: timeoutMs }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          const payload = JSON.parse(body);
          resolve(response.statusCode === 200 && payload.status === "ok" && payload.service === "sentinel-api");
        } catch {
          resolve(false);
        }
      });
    });

    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
    request.on("error", () => resolve(false));
  });
}

async function waitForApi(attempts = 12) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await checkApiHealth(500)) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function startApiServer() {
  apiChild = spawn("npm", ["run", "platform:api:serve"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      SENTINEL_API_HOST: apiHost,
      SENTINEL_API_PORT: String(apiPort),
      PLATFORM_TENANT: tenantId,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  apiChild.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  apiChild.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });
  apiChild.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Sentinel API server exited with code ${code}.`);
    }
  });
}

function stopApiServer() {
  if (!apiChild) return;
  apiChild.kill("SIGTERM");
  apiChild = null;
}

function readReadinessStatus() {
  const readinessPath = path.join(repoRoot, "reports/sentinel-deploy-readiness.json");
  if (!fs.existsSync(readinessPath)) {
    return {
      status: "UNKNOWN",
      detail: "No readiness report found. Run npm run platform:deploy:ready.",
    };
  }

  try {
    const report = JSON.parse(fs.readFileSync(readinessPath, "utf8"));
    return {
      status: report.overallStatus || "UNKNOWN",
      detail: report.checkedAt ? `Latest check: ${report.checkedAt}` : "Latest readiness report found.",
    };
  } catch {
    return {
      status: "UNKNOWN",
      detail: "Could not read reports/sentinel-deploy-readiness.json.",
    };
  }
}

function printFailure(label, result) {
  console.error(`\n${label} failed.`);
  const usefulLine = firstMatchingLine(result.output, [/error/i, /failed/i, /blocked/i, /Status:/]);
  if (usefulLine) console.error(usefulLine);
  process.exitCode = result.status || 1;
}

function printSummary({ healthResult, monitorResult, apiRunning }) {
  const state = getOperationalSummary(tenantId);
  const readiness = readReadinessStatus();

  console.log("Sentinel Operator Startup");
  console.log("");
  console.log(`Health: ${state.health.monitorStatus}`);
  console.log(`QA: ${state.health.pass}/${state.health.review}/${state.health.blocked}`);
  console.log(`Workflow: ${state.workflow.state}`);
  console.log("");
  console.log("Latest Opportunity:");
  console.log(state.opportunities.top?.title || "No persisted opportunity yet.");
  console.log("");
  console.log("Latest Plan:");
  if (state.plans.top) {
    console.log(`${state.plans.top.planId} - ${state.plans.top.title}`);
  } else {
    console.log("No persisted plan yet.");
  }
  console.log("");
  console.log("Recommended Next Step:");
  console.log(state.recommendation.nextStep);
  console.log("");
  console.log("API:");
  if (apiRunning) {
    console.log(`running at ${apiUrl}`);
  } else {
    console.log("not running");
    console.log("Start with: npm run platform:api:serve");
  }
  console.log("");
  console.log("Operator Dashboard:");
  console.log("http://localhost:5173/seo-roadmap");
  console.log("");
  console.log("Stakeholder View:");
  console.log("http://localhost:5173/seo-progress");
  console.log("");
  console.log("Readiness:");
  console.log(`${readiness.status} - ${readiness.detail}`);
  console.log("");
  console.log("Daily Report:");
  console.log("Run npm run platform:daily for the operator report.");
  console.log("");
  console.log("Checks:");
  console.log(`platform:health ${healthResult.ok ? "passed" : "failed"}`);
  console.log(`seo:monitor ${monitorResult.ok ? "passed" : "failed"}`);
}

async function main() {
  const healthResult = runNpm("platform:health");
  if (!healthResult.ok) {
    printFailure("platform:health", healthResult);
    return;
  }

  const monitorResult = runNpm("seo:monitor");
  if (!monitorResult.ok) {
    printFailure("seo:monitor", monitorResult);
    return;
  }

  let apiRunning = await checkApiHealth();

  if (!apiRunning && withApi) {
    console.log("API server not running");
    console.log(`Starting local API server at ${apiUrl}`);
    console.log("");
    startApiServer();
    apiRunning = await waitForApi();
  }

  printSummary({ healthResult, monitorResult, apiRunning });

  if (withApi && apiChild) {
    console.log("");
    console.log("Local API server is running for this session. Press Ctrl+C to stop it.");
    await new Promise(() => {});
  }
}

process.on("SIGINT", () => {
  stopApiServer();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopApiServer();
  process.exit(0);
});

main().catch((error) => {
  stopApiServer();
  console.error(error.message);
  process.exit(1);
});
