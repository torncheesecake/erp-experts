import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkDbIntegrity, defaultDbPath } from "./platform_db_integrity.mjs";
import { resolveReportPath } from "../../platform/runtime_paths.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const outputPath = resolveReportPath("sentinel-deploy-readiness.json");

function runCommand(label, command, args, { warningOnFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const passed = result.status === 0;
  const hasWarning = /\bwarning\b/i.test(output);

  if (!passed) {
    return {
      name: label,
      status: warningOnFailure ? "warning" : "fail",
      detail: output.split(/\r?\n/).find(Boolean) || `${command} ${args.join(" ")} failed`,
      exitCode: result.status ?? 1,
    };
  }

  return {
    name: label,
    status: hasWarning ? "warning" : "pass",
    detail: hasWarning ? "Completed with warnings." : "Passed.",
    exitCode: 0,
  };
}

function runNpm(label, script, options = {}) {
  return runCommand(label, "npm", ["run", script], options);
}

function getPackageScripts() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  return packageJson.scripts || {};
}

function checkGitCleanliness() {
  const result = spawnSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return {
      name: "Git",
      status: "fail",
      detail: (result.stderr || "Could not inspect git status.").trim(),
      exitCode: result.status ?? 1,
    };
  }

  const status = (result.stdout || "").trim();
  return {
    name: "Git",
    status: status ? "fail" : "pass",
    detail: status ? `Working tree is dirty: ${status.split(/\r?\n/).join("; ")}` : "Clean.",
    exitCode: status ? 1 : 0,
  };
}

function checkDb() {
  const result = checkDbIntegrity(defaultDbPath());

  if (!result.exists || !result.readable || result.errors.length) {
    return {
      name: "DB integrity",
      status: "fail",
      detail: result.errors.join("; ") || `Integrity: ${result.integrity}`,
      exitCode: 1,
    };
  }

  return {
    name: "DB integrity",
    status: "pass",
    detail: `Integrity ${result.integrity}; tables ${result.requiredTables.length}/${result.requiredTables.length + result.missingTables.length}.`,
    exitCode: 0,
  };
}

function isApiRunning() {
  return new Promise((resolve) => {
    const request = http.get("http://127.0.0.1:4317/health", { timeout: 1000 }, (response) => {
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

async function checkApiSmoke() {
  const running = await isApiRunning();
  if (!running) {
    return {
      name: "API smoke",
      status: "warning",
      detail: "Local API server is not running. Start npm run platform:api:serve to smoke test it.",
      exitCode: 0,
    };
  }

  return runNpm("API smoke", "platform:api:smoke");
}

function checkDeployDryRun(scripts) {
  if (!scripts["deploy:dry-run"]) {
    return {
      name: "Deployment dry-run",
      status: "warning",
      detail: "deploy:dry-run script is missing.",
      exitCode: 0,
    };
  }

  return runNpm("Deployment dry-run", "deploy:dry-run", { warningOnFailure: false });
}

function statusLabel(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function writeJsonReport(report) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function main() {
  const checks = [];
  const scripts = getPackageScripts();

  checks.push(checkGitCleanliness());
  checks.push(runNpm("Build", "build"));
  checks.push(runNpm("Platform health", "platform:health"));
  checks.push(checkDb());
  checks.push(runNpm("Backup verify", "backup:verify"));
  checks.push(runNpm("Restore simulation", "backup:restore:test"));
  checks.push(runNpm("SEO monitor", "seo:monitor"));
  checks.push(runNpm("Service scaffold", "service:dry-run"));
  checks.push(checkDeployDryRun(scripts));
  checks.push(await checkApiSmoke());

  const failures = checks.filter((check) => check.status === "fail");
  const warnings = checks.filter((check) => check.status === "warning");
  const overallStatus = failures.length ? "NOT READY" : warnings.length ? "READY WITH WARNINGS" : "READY";
  const report = {
    checkedAt: new Date().toISOString(),
    overallStatus,
    checks,
    warnings: warnings.map((warning) => ({
      name: warning.name,
      detail: warning.detail,
    })),
    failures: failures.map((failure) => ({
      name: failure.name,
      detail: failure.detail,
    })),
  };

  writeJsonReport(report);

  console.log("Sentinel Deployment Readiness");
  console.log("");
  checks.forEach((check) => {
    console.log(`${check.name}: ${statusLabel(check.status)}`);
    if (check.status !== "pass") {
      console.log(`  ${check.detail}`);
    }
  });
  console.log("");
  console.log(`Overall: ${overallStatus}`);
  console.log(`Report: ${path.relative(repoRoot, outputPath)}`);

  if (overallStatus === "NOT READY") {
    process.exitCode = 1;
  }
}

main();
