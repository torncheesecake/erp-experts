import fs from "node:fs";
import path from "node:path";
import {
  describeRuntimePaths,
  getRuntimePathEnvVars,
  repoRoot,
  runtimePathDefaults,
} from "../../platform/runtime_paths.mjs";

const jsonMode = process.argv.includes("--json");

function displayPath(filePath) {
  return path.isAbsolute(filePath) && filePath.startsWith(repoRoot)
    ? path.relative(repoRoot, filePath) || "."
    : filePath;
}

function validatePath(key, detail) {
  const isDirectoryPath = key !== "db";
  const targetExists = detail.exists;
  const parentExists = detail.parentExists;
  const status = key === "logs" && detail.source === "default"
    ? parentExists ? "pass" : "warning"
    : isDirectoryPath
    ? targetExists ? "pass" : "warning"
    : parentExists ? "pass" : "warning";

  return {
    key,
    envVar: detail.envVar,
    source: detail.source,
    path: detail.path,
    displayPath: displayPath(detail.path),
    defaultPath: runtimePathDefaults[key],
    exists: targetExists,
    parentPath: detail.parentPath,
    parentExists,
    status,
    message: isDirectoryPath
      ? key === "logs" && detail.source === "default" && !targetExists && parentExists
        ? "Default log directory is not present. This is acceptable locally unless file logging is enabled."
        : targetExists
          ? "Directory exists."
          : "Directory is missing. Create it before using this path on a server."
      : parentExists
        ? "DB parent directory exists."
        : "DB parent directory is missing. platform:init can create it when initialising the DB.",
  };
}

function buildReport() {
  const details = describeRuntimePaths();
  const checks = Object.entries(details).map(([key, detail]) => validatePath(key, detail));
  const warnings = checks.filter((check) => check.status === "warning").map((check) => `${check.envVar}: ${check.message}`);

  return {
    checkedAt: new Date().toISOString(),
    status: warnings.length ? "READY_WITH_WARNINGS" : "READY",
    envVars: getRuntimePathEnvVars(),
    paths: checks,
    warnings,
  };
}

function printReport(report) {
  console.log("Sentinel Runtime Paths");
  console.log("");
  report.paths.forEach((item) => {
    console.log(`${item.envVar}: ${item.displayPath} (${item.source})`);
    console.log(`  Status: ${item.status}`);
    console.log(`  ${item.message}`);
  });

  console.log("");
  console.log(`Overall: ${report.status}`);

  if (report.warnings.length) {
    console.log("");
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  console.log("");
  console.log("Mutation: none");
}

const report = buildReport();

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  printReport(report);
}

if (report.paths.some((item) => item.source === "env" && item.key === "db" && !fs.existsSync(item.parentPath))) {
  process.exitCode = 0;
}
