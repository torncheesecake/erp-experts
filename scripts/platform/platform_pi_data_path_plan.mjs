import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-data-path-plan.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-data-path-plan.md");
const envPath = path.join(repoRoot, ".env");
const persistenceModulePath = path.join(repoRoot, "platform/persistence/db.js");
const runtimePathsModulePath = path.join(repoRoot, "platform/runtime_paths.mjs");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const canonicalDataRoot = `${defaultDeployRoot}/data/seo-ops`;
const repoLocalDbRelative = "platform/persistence/platform.db";
const canonicalDbPath = `${canonicalDataRoot}/platform.db`;
const canonicalReportsPath = `${canonicalDataRoot}/reports`;
const canonicalBackupsPath = `${canonicalDataRoot}/backups`;
const canonicalLogsPath = `${defaultDeployRoot}/logs/seo-ops`;
const serviceName = "sentinel-api.service";
const apiHost = "127.0.0.1";
const apiPort = "4317";

function readLocalEnv() {
  if (!fs.existsSync(envPath)) return {};
  const values = {};
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }

  return values;
}

const localEnv = readLocalEnv();

function configValue(name, fallback = "") {
  const envValue = process.env[name] && String(process.env[name]).trim() ? String(process.env[name]).trim() : "";
  if (envValue) return envValue;
  const fileValue = localEnv[name] && String(localEnv[name]).trim() ? String(localEnv[name]).trim() : "";
  return fileValue || fallback;
}

function sshTarget({ user, host }) {
  return `${user}@${host}`;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function marker(name, command) {
  return `printf '__sentinel_${name}__='; ${command} 2>&1 || true; printf '\n'`;
}

function redactSecret(value) {
  return String(value || "")
    .replace(/(https?:\/\/)([^/@\s]+)@/gi, "$1[redacted]@")
    .replace(/([?&](?:token|key|password|secret)=)[^&\s]+/gi, "$1[redacted]")
    .replace(/((?:token|key|password|secret)[\w-]*\s*[=:]\s*)[^\s]+/gi, "$1[redacted]");
}

function remoteScript({ appPath }) {
  const quotedAppPath = shellQuote(appPath);
  return String.raw`set +e
APP_PATH=${quotedAppPath}
REPO_DB="$APP_PATH/${repoLocalDbRelative}"
CANONICAL_DB=${shellQuote(canonicalDbPath)}
CANONICAL_REPORTS=${shellQuote(canonicalReportsPath)}
CANONICAL_BACKUPS=${shellQuote(canonicalBackupsPath)}
CANONICAL_LOGS=${shellQuote(canonicalLogsPath)}
SERVICE=${shellQuote(serviceName)}
ENV_FILE="$APP_PATH/.env"
API_HOST=${shellQuote(apiHost)}
API_PORT=${shellQuote(apiPort)}

emit() {
  printf '__sentinel_%s__=%s\n' "$1" "$2"
}

emit_b64() {
  printf '__sentinel_%s_b64__=' "$1"
  printf '%s' "$2" | base64 | tr -d '\n'
  printf '\n'
}

emit shell_ok shell_ok
emit hostname "$(hostname 2>&1 || true)"
emit user "$(id -un 2>&1 || true)"
emit app_path "$APP_PATH"
emit app_exists "$([ -d "$APP_PATH" ] && printf present || printf missing)"
${marker("branch", "cd \"$APP_PATH\" 2>/dev/null && git branch --show-current")}
${marker("commit", "cd \"$APP_PATH\" 2>/dev/null && git rev-parse --short HEAD")}
${marker("git_status_count", "cd \"$APP_PATH\" 2>/dev/null && git status --short | wc -l | tr -d ' '")}
${marker("repo_db_exists", "if [ -f \"$REPO_DB\" ]; then echo present; else echo missing; fi")}
${marker("repo_db_size", "du -h \"$REPO_DB\" 2>/dev/null | cut -f1")}
${marker("repo_db_mtime", "stat -c %y \"$REPO_DB\" 2>/dev/null")}
${marker("canonical_data_dir", "if [ -d \"$CANONICAL_REPORTS/..\" ]; then echo present; else echo missing; fi")}
${marker("canonical_reports_dir", "if [ -d \"$CANONICAL_REPORTS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_backups_dir", "if [ -d \"$CANONICAL_BACKUPS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_logs_dir", "if [ -d \"$CANONICAL_LOGS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_db_exists", "if [ -f \"$CANONICAL_DB\" ]; then echo present; else echo missing; fi")}
${marker("canonical_db_size", "du -h \"$CANONICAL_DB\" 2>/dev/null | cut -f1")}
${marker("env_file", "if [ -f \"$ENV_FILE\" ]; then echo present; else echo missing; fi")}
${marker("env_platform_db_path", "grep -E '^PLATFORM_DB_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_report_output_path", "grep -E '^PLATFORM_REPORT_OUTPUT_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_reports_path", "grep -E '^PLATFORM_REPORTS_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_backup_path", "grep -E '^PLATFORM_BACKUP_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_log_path", "grep -E '^PLATFORM_LOG_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("service_enabled", "systemctl is-enabled \"$SERVICE\" 2>&1")}
${marker("service_active", "systemctl is-active \"$SERVICE\" 2>&1")}
${marker("environment_files", "systemctl show \"$SERVICE\" -p EnvironmentFiles --value 2>/dev/null")}
${marker("listen_addresses", "ss -ltn | awk '$4 ~ /:4317$/ {print $4}' | paste -sd '|' -")}
`;
}

function runSsh({ host, user, sshPort, appPath }) {
  if (!host || !user) {
    return { attempted: false, ok: false, exitCode: 1, stdout: "", stderr: "Missing host or user." };
  }

  const result = spawnSync("ssh", [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(sshPort),
    sshTarget({ user, host }),
    "bash -s",
  ], {
    cwd: repoRoot,
    encoding: "utf8",
    input: remoteScript({ appPath }),
    shell: false,
    timeout: 30_000,
  });

  return {
    attempted: true,
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function parseRemoteOutput(stdout) {
  const values = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^__sentinel_([^=]+)__=(.*)$/);
    if (match) values[match[1]] = redactSecret(match[2].trim());
  }
  return values;
}

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function persistenceSupportsPlatformDbPath() {
  const content = [persistenceModulePath, runtimePathsModulePath]
    .filter((filePath) => fs.existsSync(filePath))
    .map((filePath) => fs.readFileSync(filePath, "utf8"))
    .join("\n");
  return content.includes("process.env.PLATFORM_DB_PATH") || content.includes("PLATFORM_DB_PATH");
}

function proposedSteps() {
  return [
    "Confirm npm run platform:pi:service:verify is healthy.",
    "Validate PLATFORM_DB_PATH support with npm run platform:runtime:paths, platform:init, platform:status and platform:health.",
    "Stop sentinel-api.service.",
    `Copy ${defaultAppPath}/${repoLocalDbRelative} to ${canonicalDbPath} without deleting the source DB.`,
    "Update the Pi .env with PLATFORM_DB_PATH, PLATFORM_REPORT_OUTPUT_PATH, PLATFORM_BACKUP_PATH and PLATFORM_LOG_PATH.",
    "Run npm run platform:health using the canonical DB path.",
    "Restart sentinel-api.service.",
    "Verify http://127.0.0.1:4317/health, /state and /tenant from the Pi.",
    "Run backup verification against /srv/sentinel/data/seo-ops/backups.",
    "Keep the repo-local DB as a temporary rollback copy until service and backup checks are stable.",
  ];
}

function classify({ host, user, sshResult, remote, dbPathSupported }) {
  const checks = [];
  const warnings = [];
  const blockers = [];

  if (!host) {
    blockers.push("RASPBERRY_PI_HOST is missing from local environment or .env.");
    checks.push(makeCheck("host", "Host configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("host", "Host configured", "pass", host));
  }

  if (!user) {
    blockers.push("RASPBERRY_PI_USER is missing from local environment or .env.");
    checks.push(makeCheck("user", "User configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("user", "User configured", "pass", "Configured."));
  }

  if (!sshResult.attempted) {
    blockers.push("SSH checks were not attempted because host or user is missing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "Not attempted."));
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only data path planning checks failed.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", redactSecret(sshResult.stderr || sshResult.stdout || "SSH failed.")));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (remote.shell_ok === "shell_ok") {
    checks.push(makeCheck("remote_shell", "Remote shell", "pass", "Read-only checks executed."));
  } else if (sshResult.ok) {
    blockers.push("Remote data path script did not return the expected marker.");
    checks.push(makeCheck("remote_shell", "Remote shell", "fail", "Missing shell marker."));
  }

  if (remote.repo_db_exists === "present") {
    checks.push(makeCheck("repo_db", "Repo-local DB", "pass", `Present${remote.repo_db_size ? ` (${remote.repo_db_size})` : ""}.`));
  } else if (sshResult.ok) {
    blockers.push("Repo-local DB is missing, so there is no known source DB to migrate.");
    checks.push(makeCheck("repo_db", "Repo-local DB", "fail", "Missing."));
  }

  for (const [key, label] of [
    ["canonical_data_dir", "Canonical data directory"],
    ["canonical_reports_dir", "Canonical reports directory"],
    ["canonical_backups_dir", "Canonical backups directory"],
    ["canonical_logs_dir", "Canonical logs directory"],
  ]) {
    if (remote[key] === "present") checks.push(makeCheck(key, label, "pass", "Present."));
    else if (sshResult.ok) {
      warnings.push(`${label} is missing and would need to be created during the future migration.`);
      checks.push(makeCheck(key, label, "warning", "Missing."));
    }
  }

  if (remote.canonical_db_exists === "present") {
    warnings.push(`Canonical DB already exists at ${canonicalDbPath}. Future migration must compare before copying.`);
    checks.push(makeCheck("canonical_db", "Canonical DB", "warning", `Present${remote.canonical_db_size ? ` (${remote.canonical_db_size})` : ""}.`));
  } else if (sshResult.ok) {
    checks.push(makeCheck("canonical_db", "Canonical DB", "pass", "Missing, as expected before migration."));
  }

  if (remote.env_file === "present") checks.push(makeCheck("env_file", "Pi service .env", "pass", `${defaultAppPath}/.env`));
  else if (sshResult.ok) {
    blockers.push("Pi service .env is missing.");
    checks.push(makeCheck("env_file", "Pi service .env", "fail", "Missing."));
  }

  const envDb = remote.env_platform_db_path || "";
  if (envDb === canonicalDbPath) {
    checks.push(makeCheck("env_db_path", "PLATFORM_DB_PATH", "pass", envDb));
  } else {
    warnings.push("Pi .env does not yet point PLATFORM_DB_PATH at the canonical DB path. This is expected before migration.");
    checks.push(makeCheck("env_db_path", "PLATFORM_DB_PATH", "warning", envDb || "Not set."));
  }

  const reportEnv = remote.env_report_output_path || remote.env_reports_path || "";
  if (reportEnv === canonicalReportsPath) checks.push(makeCheck("env_reports_path", "Report output path", "pass", reportEnv));
  else {
    warnings.push("Pi .env does not yet point reports at the canonical reports path.");
    checks.push(makeCheck("env_reports_path", "Report output path", "warning", reportEnv || "Not set."));
  }

  if (remote.env_backup_path === canonicalBackupsPath) checks.push(makeCheck("env_backup_path", "Backup path", "pass", remote.env_backup_path));
  else {
    warnings.push("Pi .env does not yet point backups at the canonical backup path.");
    checks.push(makeCheck("env_backup_path", "Backup path", "warning", remote.env_backup_path || "Not set."));
  }

  if (remote.env_log_path === canonicalLogsPath) checks.push(makeCheck("env_log_path", "Log path", "pass", remote.env_log_path));
  else {
    warnings.push("Pi .env does not yet point logs at the canonical log path.");
    checks.push(makeCheck("env_log_path", "Log path", "warning", remote.env_log_path || "Not set."));
  }

  if (remote.service_active === "active") checks.push(makeCheck("service_active", "Service active", "pass", "active"));
  else if (sshResult.ok) {
    warnings.push("sentinel-api.service is not active. Migration planning can continue, but service verification should be rerun before migration.");
    checks.push(makeCheck("service_active", "Service active", "warning", remote.service_active || "unknown"));
  }

  if (String(remote.listen_addresses || "").includes(`${apiHost}:${apiPort}`)) {
    checks.push(makeCheck("api_listener", "API listener", "pass", `${apiHost}:${apiPort}`));
  } else if (sshResult.ok) {
    warnings.push("API is not currently listening on 127.0.0.1:4317. Run service verification before migration.");
    checks.push(makeCheck("api_listener", "API listener", "warning", remote.listen_addresses || "none"));
  }

  if (dbPathSupported) {
    checks.push(makeCheck("db_path_support", "PLATFORM_DB_PATH support", "pass", "Persistence module references PLATFORM_DB_PATH."));
  } else {
    warnings.push("Persistence code does not currently reference PLATFORM_DB_PATH. Implement support before executing the migration.");
    checks.push(makeCheck("db_path_support", "PLATFORM_DB_PATH support", "warning", "Not detected."));
  }

  const status = blockers.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY_FOR_MIGRATION";
  return { status, checks, warnings, blockers };
}

function buildReport() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const sshResult = runSsh({ host, user, sshPort, appPath });
  const remote = sshResult.ok ? parseRemoteOutput(sshResult.stdout) : {};
  const dbPathSupported = persistenceSupportsPlatformDbPath();
  const classification = classify({ host, user, sshResult, remote, dbPathSupported });

  return {
    checkedAt: new Date().toISOString(),
    status: classification.status,
    target: {
      host,
      sshUser: user,
      sshPort,
      appPath,
      repoLocalDbPath: `${appPath}/${repoLocalDbRelative}`,
      canonicalDbPath,
      canonicalReportsPath,
      canonicalBackupsPath,
      canonicalLogsPath,
    },
    ssh: {
      attempted: sshResult.attempted,
      ok: sshResult.ok,
      exitCode: sshResult.exitCode,
      stderr: redactSecret((sshResult.stderr || "").trim()),
    },
    remote: {
      hostname: remote.hostname || "unknown",
      user: remote.user || "unknown",
      branch: remote.branch || "unknown",
      commit: remote.commit || "unknown",
      gitStatusCount: Number(remote.git_status_count || 0),
      repoDbExists: remote.repo_db_exists || "unknown",
      repoDbSize: remote.repo_db_size || "unknown",
      repoDbModifiedAt: remote.repo_db_mtime || "unknown",
      canonicalDataDir: remote.canonical_data_dir || "unknown",
      canonicalReportsDir: remote.canonical_reports_dir || "unknown",
      canonicalBackupsDir: remote.canonical_backups_dir || "unknown",
      canonicalLogsDir: remote.canonical_logs_dir || "unknown",
      canonicalDbExists: remote.canonical_db_exists || "unknown",
      canonicalDbSize: remote.canonical_db_size || "unknown",
      envFile: remote.env_file || "unknown",
      envPlatformDbPath: remote.env_platform_db_path || "",
      envReportOutputPath: remote.env_report_output_path || remote.env_reports_path || "",
      envBackupPath: remote.env_backup_path || "",
      envLogPath: remote.env_log_path || "",
      serviceActive: remote.service_active || "unknown",
      serviceEnabled: remote.service_enabled || "unknown",
      serviceEnvironmentFiles: remote.environment_files || "unknown",
      listenAddresses: remote.listen_addresses || "none",
    },
    localCapabilities: {
      platformDbPathSupported: dbPathSupported,
    },
    proposedSteps: proposedSteps(),
    checks: classification.checks,
    warnings: classification.warnings,
    blockers: classification.blockers,
    recommendedNextStep: classification.blockers.length
      ? "Resolve data path planning blockers, then rerun npm run platform:pi:data:path:plan."
      : dbPathSupported
        ? "Review the migration plan. Execute the DB copy and service env update only in a separate approved task."
        : "Implement PLATFORM_DB_PATH support first, then rerun this dry-run before any Pi DB migration.",
  };
}

function statusIcon(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Pi Data Path Migration Plan Report",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    "",
    "## Target Paths",
    "",
    `- Repo-local DB: ${report.target.repoLocalDbPath}`,
    `- Canonical DB: ${report.target.canonicalDbPath}`,
    `- Canonical reports: ${report.target.canonicalReportsPath}`,
    `- Canonical backups: ${report.target.canonicalBackupsPath}`,
    `- Canonical logs: ${report.target.canonicalLogsPath}`,
    "",
    "## Current Pi State",
    "",
    `- Host: ${report.target.host}`,
    `- App path: ${report.target.appPath}`,
    `- Git commit: ${report.remote.commit}`,
    `- Repo-local DB: ${report.remote.repoDbExists} (${report.remote.repoDbSize})`,
    `- Canonical DB: ${report.remote.canonicalDbExists} (${report.remote.canonicalDbSize})`,
    `- Service active: ${report.remote.serviceActive}`,
    `- Listener: ${report.remote.listenAddresses}`,
    "",
    "## Pi .env State",
    "",
    `- PLATFORM_DB_PATH: ${report.remote.envPlatformDbPath || "not set"}`,
    `- PLATFORM_REPORT_OUTPUT_PATH: ${report.remote.envReportOutputPath || "not set"}`,
    `- PLATFORM_BACKUP_PATH: ${report.remote.envBackupPath || "not set"}`,
    `- PLATFORM_LOG_PATH: ${report.remote.envLogPath || "not set"}`,
    "",
    "## Proposed Future Migration Steps",
    "",
    ...report.proposedSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "These steps were not executed by this command.",
    "",
    "## Checks",
    "",
    ...report.checks.map((check) => `- ${statusIcon(check.status)}: ${check.label} - ${check.detail}`),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((blocker) => `- ${blocker}`) : ["- None"]),
    "",
    "## Recommended Next Step",
    "",
    report.recommendedNextStep,
  ];

  return `${lines.join("\n")}\n`;
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownReportPath, buildMarkdown(report), "utf8");
}

function printReport(report) {
  console.log("Sentinel Pi Data Path Migration Plan");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`Status: ${report.status}`);
  console.log("");
  console.log("Current paths:");
  console.log(`- Repo-local DB: ${report.target.repoLocalDbPath} (${report.remote.repoDbExists})`);
  console.log(`- Canonical DB: ${report.target.canonicalDbPath} (${report.remote.canonicalDbExists})`);
  console.log(`- Canonical reports: ${report.target.canonicalReportsPath} (${report.remote.canonicalReportsDir})`);
  console.log(`- Canonical backups: ${report.target.canonicalBackupsPath} (${report.remote.canonicalBackupsDir})`);
  console.log(`- Canonical logs: ${report.target.canonicalLogsPath} (${report.remote.canonicalLogsDir})`);
  console.log("");
  console.log("Pi .env:");
  console.log(`- PLATFORM_DB_PATH: ${report.remote.envPlatformDbPath || "not set"}`);
  console.log(`- PLATFORM_REPORT_OUTPUT_PATH: ${report.remote.envReportOutputPath || "not set"}`);
  console.log(`- PLATFORM_BACKUP_PATH: ${report.remote.envBackupPath || "not set"}`);
  console.log(`- PLATFORM_LOG_PATH: ${report.remote.envLogPath || "not set"}`);
  console.log("");
  console.log("Proposed future steps, not executed:");
  report.proposedSteps.forEach((step, index) => console.log(`${index + 1}. ${step}`));
  console.log("");

  if (report.warnings.length) {
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
    console.log("");
  }

  if (report.blockers.length) {
    console.log("Blockers:");
    report.blockers.forEach((blocker) => console.log(`- ${blocker}`));
    console.log("");
  }

  console.log("Checks:");
  report.checks.forEach((check) => console.log(`- ${check.label}: ${check.status} - ${check.detail}`));
  console.log("");
  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const report = buildReport();
  writeReports(report);
  printReport(report);
  if (report.status === "NOT_READY") process.exitCode = 1;
}

main();
