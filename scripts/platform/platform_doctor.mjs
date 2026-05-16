import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkDbIntegrity, defaultDbPath } from "./platform_db_integrity.mjs";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const outputPath = path.join(repoRoot, "reports/sentinel-doctor.json");
const apiHost = process.env.SENTINEL_API_HOST || "127.0.0.1";
const apiPort = Number(process.env.SENTINEL_API_PORT || 4317);
const apiUrl = `http://${apiHost}:${apiPort}`;
const requiredPackageScripts = [
  "platform:start",
  "platform:doctor",
  "platform:health",
  "platform:status",
  "platform:state",
  "platform:deploy:ready",
  "platform:cadence",
  "platform:notify",
  "platform:daily",
  "platform:stakeholder",
  "platform:api:serve",
  "platform:api:smoke",
  "backup:verify",
  "backup:restore:test",
  "seo:monitor",
];

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath) || ".";
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    return {
      __readError: error.message,
    };
  }
}

function check(name, status, detail = "") {
  return { name, status, detail };
}

function runCommand(name, command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const firstUsefulLine = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && /failed|error|warning|Status:|HEALTHY|READY|pass/i.test(line));

  return {
    name,
    status: result.status === 0 ? "pass" : "fail",
    detail: result.status === 0 ? "Passed." : firstUsefulLine || `${command} ${args.join(" ")} failed.`,
    exitCode: result.status ?? 1,
  };
}

function runNpm(name, script) {
  return runCommand(name, "npm", ["run", script]);
}

function checkGitState() {
  const result = spawnSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return check("Git", "fail", (result.stderr || "Could not inspect git status.").trim());
  }

  const status = (result.stdout || "").trim();
  if (!status) return check("Git", "pass", "Clean.");

  const lines = status.split(/\r?\n/);
  const critical = lines.filter((line) => /src\/quizlift|credentials\/|private\//i.test(line));
  if (critical.length) {
    return check("Git", "fail", `Critical dirty paths: ${critical.join("; ")}`);
  }

  return check("Git", "warning", `Working tree has local changes: ${lines.join("; ")}`);
}

function checkPackageScripts() {
  const packagePath = path.join(repoRoot, "package.json");
  if (!fs.existsSync(packagePath)) return check("Package scripts", "fail", "package.json is missing.");

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const scripts = packageJson.scripts || {};
  const missing = requiredPackageScripts.filter((script) => !scripts[script]);

  if (missing.length) {
    return check("Package scripts", "fail", `Missing scripts: ${missing.join(", ")}`);
  }

  return check("Package scripts", "pass", `${requiredPackageScripts.length} required scripts present.`);
}

function checkDb() {
  const result = checkDbIntegrity(defaultDbPath());

  if (!result.exists || !result.readable || result.errors.length) {
    return {
      check: check("DB", "fail", result.errors.join("; ") || `Integrity: ${result.integrity}`),
      integrity: result,
    };
  }

  return {
    check: check(
      "DB",
      "pass",
      `Integrity ${result.integrity}; tables ${result.requiredTables.length}/${result.requiredTables.length + result.missingTables.length}.`,
    ),
    integrity: result,
  };
}

function checkState(tenantId) {
  try {
    const state = getOperationalSummary(tenantId);
    return {
      check: check("Operational state", "pass", `${state.workflow.state}; ${state.health.monitorStatus}.`),
      state,
    };
  } catch (error) {
    return {
      check: check("Operational state", "fail", error.message),
      state: null,
    };
  }
}

function checkGeneratedStateFile() {
  const state = readJson("reports/sentinel-state.json");
  if (!state) return check("State report", "warning", "reports/sentinel-state.json is missing. Run npm run platform:state.");
  if (state.__readError) return check("State report", "warning", `Could not parse sentinel-state.json: ${state.__readError}`);
  return check("State report", "pass", `Generated ${state.generatedAt || "unknown time"}.`);
}

function checkCadenceSummary() {
  const cadence = readJson("reports/sentinel-cadence-summary.json");
  if (!cadence) return { check: check("Cadence", "warning", "No cadence run recorded yet."), cadence: null };
  if (cadence.__readError) return { check: check("Cadence", "warning", `Could not parse cadence summary: ${cadence.__readError}`), cadence: null };

  return {
    check: check("Cadence", "pass", `${cadence.mode || "unknown"} run at ${cadence.ranAt || "unknown time"}.`),
    cadence,
  };
}

function checkNotifications() {
  const files = [
    "reports/notifications/operator-notification.md",
    "reports/notifications/operator-notification.json",
    "reports/notifications/stakeholder-notification.md",
    "reports/notifications/stakeholder-notification.json",
  ];
  const missing = files.filter((file) => !exists(file));

  if (missing.length === files.length) {
    return check("Notifications", "warning", "No notification payloads found. Run npm run platform:notify -- --all.");
  }
  if (missing.length) {
    return check("Notifications", "warning", `Some payloads are missing: ${missing.join(", ")}`);
  }

  return check("Notifications", "pass", "Operator and stakeholder payloads found.");
}

function checkReadinessReport() {
  const readiness = readJson("reports/sentinel-deploy-readiness.json");
  if (!readiness) return { check: check("Deployment readiness", "warning", "No readiness report found. Run npm run platform:deploy:ready."), readiness: null };
  if (readiness.__readError) return { check: check("Deployment readiness", "warning", `Could not parse readiness report: ${readiness.__readError}`), readiness: null };

  const status = readiness.overallStatus || "UNKNOWN";
  return {
    check: check("Deployment readiness", status === "NOT READY" ? "fail" : status === "READY" ? "pass" : "warning", status),
    readiness,
  };
}

function checkRouteGuard() {
  const appPath = path.join(repoRoot, "src/App.jsx");
  const reportsPath = path.join(repoRoot, "src/pages/Reports.jsx");
  if (!fs.existsSync(appPath)) return check("Route guard", "warning", "src/App.jsx is missing.");

  const app = fs.readFileSync(appPath, "utf8");
  const reports = fs.existsSync(reportsPath) ? fs.readFileSync(reportsPath, "utf8") : "";
  const hasDevOnlyRoadmap = /SeoRoadmap\s*=\s*import\.meta\.env\.DEV/.test(app);
  const hasProdRedirect = /import\.meta\.env\.PROD[\s\S]{0,160}<Navigate\s+to="\/seo-progress"/.test(app);
  const hasRoadmapRoute = /path="\/seo-roadmap"/.test(app);
  const reportsUseProgress = /to="\/seo-progress"/.test(reports) && !/to="\/seo-roadmap"/.test(reports);

  if (hasDevOnlyRoadmap && hasProdRedirect && hasRoadmapRoute && reportsUseProgress) {
    return check("Route guard", "pass", "Production roadmap redirects to stakeholder progress route; reports link is safe.");
  }

  const missing = [];
  if (!hasDevOnlyRoadmap) missing.push("dev-only SeoRoadmap import");
  if (!hasProdRedirect) missing.push("production redirect to /seo-progress");
  if (!hasRoadmapRoute) missing.push("/seo-roadmap route");
  if (!reportsUseProgress) missing.push("reports link to /seo-progress");
  return check("Route guard", "warning", `Could not verify: ${missing.join(", ")}`);
}

function checkDocsAndIgnore() {
  const requiredFiles = [
    "platform/README.md",
    "docs/SEO_SYSTEM_CHECKPOINT.md",
    "docs/SENTINEL_AUTOMATION_CADENCE.md",
    "docs/RASPBERRY_PI_SERVICE_PLAN.md",
  ];
  const missingFiles = requiredFiles.filter((file) => !exists(file));
  const gitignore = exists(".gitignore") ? fs.readFileSync(path.join(repoRoot, ".gitignore"), "utf8") : "";
  const missingIgnores = ["reports/sentinel-doctor.json"].filter((entry) => !gitignore.includes(entry));

  if (missingFiles.length || missingIgnores.length) {
    return check(
      "Docs and ignore policy",
      "warning",
      [
        missingFiles.length ? `Missing docs: ${missingFiles.join(", ")}` : "",
        missingIgnores.length ? `Missing ignore entries: ${missingIgnores.join(", ")}` : "",
      ].filter(Boolean).join("; "),
    );
  }

  return check("Docs and ignore policy", "pass", "Core docs present and doctor report ignored.");
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
          if (response.statusCode === 200 && payload.status === "ok" && payload.service === "sentinel-api") {
            resolve(check("API", "pass", `Running at ${apiUrl}.`));
            return;
          }
          resolve(check("API", "warning", `${apiUrl} returned unexpected health payload.`));
        } catch {
          resolve(check("API", "warning", `${apiUrl} returned non-JSON health response.`));
        }
      });
    });

    request.on("timeout", () => {
      request.destroy();
      resolve(check("API", "warning", "Local API is not running."));
    });
    request.on("error", () => resolve(check("API", "warning", "Local API is not running.")));
  });
}

function printStatusLine(label, value) {
  console.log(`${label}: ${value}`);
}

function statusWord(checkStatus) {
  if (checkStatus === "pass") return "pass";
  if (checkStatus === "warning") return "warning";
  return "fail";
}

function buildOverall(checks) {
  const failures = checks.filter((item) => item.status === "fail");
  const warnings = checks.filter((item) => item.status === "warning");
  if (failures.length) return "NEEDS FIXING";
  if (warnings.length) return "HEALTHY WITH WARNINGS";
  return "HEALTHY";
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function printDoctor({ checks, state, dbIntegrity, cadence, readiness, overallStatus, recommendedNextCommand, fullMode }) {
  const git = checks.find((item) => item.name === "Git");
  const api = checks.find((item) => item.name === "API");
  const cadenceCheck = checks.find((item) => item.name === "Cadence");
  const notifications = checks.find((item) => item.name === "Notifications");
  const readinessCheck = checks.find((item) => item.name === "Deployment readiness");
  const latestRun = state?.runs?.latest?.[0] || dbIntegrity?.latestRun || null;

  console.log("Sentinel Doctor");
  console.log("");
  printStatusLine("Git", git?.status === "pass" ? "clean" : statusWord(git?.status));
  printStatusLine("DB", dbIntegrity?.integrity === "ok" ? "healthy" : statusWord(checks.find((item) => item.name === "DB")?.status));
  printStatusLine("SEO", state?.health?.monitorStatus || dbIntegrity?.latestSnapshot?.monitorStatus || "unknown");
  printStatusLine(
    "QA",
    state?.health ? `${state.health.pass}/${state.health.review}/${state.health.blocked}` : dbIntegrity?.latestSnapshot ? `${dbIntegrity.latestSnapshot.passCount}/${dbIntegrity.latestSnapshot.reviewCount}/${dbIntegrity.latestSnapshot.blockedCount}` : "unknown",
  );
  printStatusLine("API", api?.status === "pass" ? "running" : "not running");
  printStatusLine("Cadence", cadence ? "latest run found" : statusWord(cadenceCheck?.status));
  printStatusLine("Notifications", notifications?.status === "pass" ? "operator/stakeholder payloads found" : statusWord(notifications?.status));
  printStatusLine("Deployment readiness", readiness?.overallStatus || readinessCheck?.detail || "unknown");
  if (latestRun) {
    printStatusLine("Latest run", `${latestRun.command} ${latestRun.status}`);
  }
  console.log("");
  printStatusLine("Overall", overallStatus);

  const warnings = checks.filter((item) => item.status === "warning");
  const failures = checks.filter((item) => item.status === "fail");

  if (warnings.length) {
    console.log("");
    console.log("Warnings:");
    warnings.forEach((warning) => console.log(`- ${warning.name}: ${warning.detail}`));
  }

  if (failures.length) {
    console.log("");
    console.log("Needs fixing:");
    failures.forEach((failure) => console.log(`- ${failure.name}: ${failure.detail}`));
  }

  console.log("");
  console.log("Next:");
  console.log(recommendedNextCommand);
  console.log("");
  console.log(`Report: ${rel(outputPath)}`);
  if (fullMode) {
    console.log("Full mode: ran platform:health, backup:verify, platform:state and seo:monitor.");
  }
}

async function main() {
  const tenantId = getArgValue("--tenant", process.env.PLATFORM_TENANT || "erp-experts");
  const fullMode = process.argv.includes("--full");
  const checks = [];

  checks.push(checkGitState());
  checks.push(checkPackageScripts());

  const { check: dbCheck, integrity: dbIntegrity } = checkDb();
  checks.push(dbCheck);

  const { check: stateCheck, state } = checkState(tenantId);
  checks.push(stateCheck);
  checks.push(checkGeneratedStateFile());

  const { check: cadenceCheck, cadence } = checkCadenceSummary();
  checks.push(cadenceCheck);
  checks.push(checkNotifications());

  const { check: readinessCheck, readiness } = checkReadinessReport();
  checks.push(readinessCheck);

  checks.push(checkRouteGuard());
  checks.push(checkDocsAndIgnore());
  checks.push(await checkApiHealth());

  if (fullMode) {
    checks.push(runNpm("Full platform health", "platform:health"));
    checks.push(runNpm("Full backup verify", "backup:verify"));
    checks.push(runNpm("Full platform state", "platform:state"));
    checks.push(runNpm("Full SEO monitor", "seo:monitor"));
  }

  const overallStatus = buildOverall(checks);
  const warnings = checks.filter((item) => item.status === "warning");
  const failures = checks.filter((item) => item.status === "fail");
  const recommendedNextCommand = failures.length ? "npm run platform:health" : "npm run platform:start";
  const report = {
    checkedAt: new Date().toISOString(),
    tenantId,
    fullMode,
    overallStatus,
    checks,
    warnings: warnings.map((warning) => ({ name: warning.name, detail: warning.detail })),
    failures: failures.map((failure) => ({ name: failure.name, detail: failure.detail })),
    summary: {
      health: state?.health || null,
      workflow: state?.workflow?.state || null,
      latestSnapshot: dbIntegrity.latestSnapshot,
      latestRun: state?.runs?.latest?.[0] || dbIntegrity.latestRun || null,
      latestCadenceRun: cadence?.ranAt || null,
      readiness: readiness?.overallStatus || null,
      api: checks.find((item) => item.name === "API")?.status || "unknown",
    },
    recommendedNextCommand,
  };

  writeReport(report);
  printDoctor({ checks, state, dbIntegrity, cadence, readiness, overallStatus, recommendedNextCommand, fullMode });

  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
