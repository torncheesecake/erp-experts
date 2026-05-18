import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-data-path-verify.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-data-path-verify.md");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const canonicalDataRoot = `${defaultDeployRoot}/data/seo-ops`;
const repoLocalDbRelative = "platform/persistence/platform.db";
const repoLocalDbPath = `${defaultAppPath}/${repoLocalDbRelative}`;
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

function decodeB64(value) {
  if (!value) return "";
  try {
    return redactSecret(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    return "";
  }
}

function parseJsonPayload(value) {
  const text = decodeB64(value);
  if (!text) return { text: "", json: null };
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
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

curl_endpoint() {
  NAME="$1"
  URL="$2"
  ERR_FILE="$(mktemp /tmp/sentinel-data-path-verify-curl.XXXXXX.err 2>/dev/null)"
  BODY="$(curl -fsS --max-time 8 "$URL" 2>"$ERR_FILE")"
  CURL_STATUS=$?
  ERROR_BODY="$(cat "$ERR_FILE" 2>/dev/null)"
  rm -f "$ERR_FILE" >/dev/null 2>&1 || true
  emit "$NAME"_status "$CURL_STATUS"
  if [ "$CURL_STATUS" -eq 0 ]; then
    emit_b64 "$NAME" "$BODY"
  else
    emit_b64 "$NAME"_error "$ERROR_BODY"
  fi
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
${marker("canonical_db_exists", "if [ -f \"$CANONICAL_DB\" ]; then echo present; else echo missing; fi")}
${marker("canonical_db_size", "du -h \"$CANONICAL_DB\" 2>/dev/null | cut -f1")}
${marker("canonical_reports_dir", "if [ -d \"$CANONICAL_REPORTS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_backups_dir", "if [ -d \"$CANONICAL_BACKUPS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_logs_dir", "if [ -d \"$CANONICAL_LOGS\" ]; then echo present; else echo missing; fi")}
${marker("env_file", "if [ -f \"$ENV_FILE\" ]; then echo present; else echo missing; fi")}
${marker("env_platform_db_path", "grep -E '^PLATFORM_DB_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_report_output_path", "grep -E '^PLATFORM_REPORT_OUTPUT_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_backup_path", "grep -E '^PLATFORM_BACKUP_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_log_path", "grep -E '^PLATFORM_LOG_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("service_active", "systemctl is-active \"$SERVICE\" 2>&1")}
${marker("service_enabled", "systemctl is-enabled \"$SERVICE\" 2>&1")}
${marker("listen_addresses", "ss -ltn | awk '$4 ~ /:4317$/ {print $4}' | paste -sd '|' -")}
RUNTIME_OUTPUT="$(cd "$APP_PATH" 2>/dev/null && set -a && . "$ENV_FILE" 2>/dev/null && set +a && node scripts/platform/platform_runtime_paths.mjs --json 2>&1)"
emit runtime_paths_status "$?"
emit_b64 runtime_paths "$RUNTIME_OUTPUT"
curl_endpoint health "http://$API_HOST:$API_PORT/health"
curl_endpoint state "http://$API_HOST:$API_PORT/state"
curl_endpoint tenant "http://$API_HOST:$API_PORT/tenant"
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
    timeout: 45_000,
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

function addCheck(checks, failures, warnings, { id, label, status, detail, failure, warning }) {
  checks.push({ id, label, status, detail });
  if (status === "fail" && failure) failures.push(failure);
  if (status === "warning" && warning) warnings.push(warning);
}

function classify({ host, user, sshResult, remote }) {
  const checks = [];
  const warnings = [];
  const failures = [];

  if (!host) addCheck(checks, failures, warnings, { id: "host", label: "Host configured", status: "fail", detail: "Missing.", failure: "RASPBERRY_PI_HOST is missing." });
  else addCheck(checks, failures, warnings, { id: "host", label: "Host configured", status: "pass", detail: host });

  if (!user) addCheck(checks, failures, warnings, { id: "user", label: "User configured", status: "fail", detail: "Missing.", failure: "RASPBERRY_PI_USER is missing." });
  else addCheck(checks, failures, warnings, { id: "user", label: "User configured", status: "pass", detail: "Configured." });

  if (!sshResult.attempted) {
    addCheck(checks, failures, warnings, { id: "ssh", label: "SSH reachable", status: "fail", detail: "Not attempted.", failure: "SSH was not attempted because host or user is missing." });
  } else if (!sshResult.ok) {
    addCheck(checks, failures, warnings, { id: "ssh", label: "SSH reachable", status: "fail", detail: redactSecret(sshResult.stderr || sshResult.stdout || "SSH failed."), failure: "SSH read-only verification failed." });
  } else {
    addCheck(checks, failures, warnings, { id: "ssh", label: "SSH reachable", status: "pass", detail: "Non-interactive SSH succeeded." });
  }

  if (remote.shell_ok === "shell_ok") addCheck(checks, failures, warnings, { id: "remote_shell", label: "Remote shell", status: "pass", detail: "Read-only checks executed." });
  else if (sshResult.ok) addCheck(checks, failures, warnings, { id: "remote_shell", label: "Remote shell", status: "fail", detail: "Missing marker.", failure: "Remote verification did not return expected Sentinel markers." });

  if (remote.canonical_db_exists === "present") {
    addCheck(checks, failures, warnings, { id: "canonical_db", label: "Canonical DB", status: "pass", detail: `Present${remote.canonical_db_size ? ` (${remote.canonical_db_size})` : ""}.` });
  } else if (sshResult.ok) {
    addCheck(checks, failures, warnings, { id: "canonical_db", label: "Canonical DB", status: "fail", detail: "Missing.", failure: `Canonical DB is missing: ${canonicalDbPath}` });
  }

  if (remote.repo_db_exists === "present") {
    addCheck(checks, failures, warnings, { id: "repo_db", label: "Repo-local rollback DB", status: "pass", detail: `Present${remote.repo_db_size ? ` (${remote.repo_db_size})` : ""}.` });
  } else if (sshResult.ok) {
    addCheck(checks, failures, warnings, { id: "repo_db", label: "Repo-local rollback DB", status: "fail", detail: "Missing.", failure: `Repo-local rollback DB is missing: ${repoLocalDbPath}` });
  }

  if (remote.env_file === "present") addCheck(checks, failures, warnings, { id: "env_file", label: "Pi .env", status: "pass", detail: `${defaultAppPath}/.env` });
  else if (sshResult.ok) addCheck(checks, failures, warnings, { id: "env_file", label: "Pi .env", status: "fail", detail: "Missing.", failure: "Pi service .env is missing." });

  if (remote.env_platform_db_path === canonicalDbPath) {
    addCheck(checks, failures, warnings, { id: "env_db_path", label: "PLATFORM_DB_PATH", status: "pass", detail: canonicalDbPath });
  } else if (sshResult.ok) {
    addCheck(checks, failures, warnings, { id: "env_db_path", label: "PLATFORM_DB_PATH", status: "fail", detail: remote.env_platform_db_path || "not set", failure: "Pi .env does not point PLATFORM_DB_PATH at the canonical DB." });
  }

  for (const [id, label, actual, expected] of [
    ["env_report_path", "PLATFORM_REPORT_OUTPUT_PATH", remote.env_report_output_path, canonicalReportsPath],
    ["env_backup_path", "PLATFORM_BACKUP_PATH", remote.env_backup_path, canonicalBackupsPath],
    ["env_log_path", "PLATFORM_LOG_PATH", remote.env_log_path, canonicalLogsPath],
  ]) {
    if (actual === expected) addCheck(checks, failures, warnings, { id, label, status: "pass", detail: expected });
    else if (sshResult.ok) addCheck(checks, failures, warnings, { id, label, status: "warning", detail: actual || "not set", warning: `${label} is not set to the canonical path.` });
  }

  for (const [id, label, value] of [
    ["reports_dir", "Canonical reports directory", remote.canonical_reports_dir],
    ["backups_dir", "Canonical backups directory", remote.canonical_backups_dir],
    ["logs_dir", "Canonical logs directory", remote.canonical_logs_dir],
  ]) {
    if (value === "present") addCheck(checks, failures, warnings, { id, label, status: "pass", detail: "Present." });
    else if (sshResult.ok) addCheck(checks, failures, warnings, { id, label, status: "warning", detail: "Missing.", warning: `${label} is missing.` });
  }

  if (remote.service_active === "active") addCheck(checks, failures, warnings, { id: "service_active", label: "Service active", status: "pass", detail: "active" });
  else if (sshResult.ok) addCheck(checks, failures, warnings, { id: "service_active", label: "Service active", status: "fail", detail: remote.service_active || "unknown", failure: "sentinel-api.service is not active." });

  const listenAddresses = String(remote.listen_addresses || "").split("|").filter(Boolean);
  if (listenAddresses.includes("127.0.0.1:4317") && !listenAddresses.some((address) => address.startsWith("0.0.0.0:") || address.startsWith("[::]:"))) {
    addCheck(checks, failures, warnings, { id: "listener", label: "API listener", status: "pass", detail: listenAddresses.join(", ") });
  } else if (sshResult.ok) {
    addCheck(checks, failures, warnings, { id: "listener", label: "API listener", status: "fail", detail: listenAddresses.join(", ") || "none", failure: "API is not confirmed as localhost-only on 127.0.0.1:4317." });
  }

  const health = parseJsonPayload(remote.health_b64);
  if (remote.health_status === "0" && health.json?.status === "ok") addCheck(checks, failures, warnings, { id: "health", label: "GET /health", status: "pass", detail: "ok" });
  else if (sshResult.ok) addCheck(checks, failures, warnings, { id: "health", label: "GET /health", status: "fail", detail: decodeB64(remote.health_error_b64) || "Unavailable.", failure: "API health endpoint failed." });

  const state = parseJsonPayload(remote.state_b64);
  if (remote.state_status === "0" && state.json) addCheck(checks, failures, warnings, { id: "state", label: "GET /state", status: "pass", detail: "Returned JSON." });
  else if (sshResult.ok) addCheck(checks, failures, warnings, { id: "state", label: "GET /state", status: "fail", detail: decodeB64(remote.state_error_b64) || "Unavailable.", failure: "API state endpoint failed or returned non-JSON." });

  const tenant = parseJsonPayload(remote.tenant_b64);
  if (remote.tenant_status === "0" && tenant.json) addCheck(checks, failures, warnings, { id: "tenant", label: "GET /tenant", status: "pass", detail: tenant.json.name ? `${tenant.json.name} (${tenant.json.tenantId || "unknown"})` : "Returned JSON." });
  else if (sshResult.ok) addCheck(checks, failures, warnings, { id: "tenant", label: "GET /tenant", status: "warning", detail: decodeB64(remote.tenant_error_b64) || "Unavailable.", warning: "API tenant endpoint did not return JSON." });

  const runtime = parseJsonPayload(remote.runtime_paths_b64);
  const runtimeDbPath = runtime.json?.paths?.find?.((item) => item.key === "db")?.path || runtime.json?.paths?.db?.path || null;
  if (remote.runtime_paths_status === "0" && runtimeDbPath === canonicalDbPath) {
    addCheck(checks, failures, warnings, { id: "runtime_paths", label: "Runtime paths command", status: "pass", detail: `DB ${canonicalDbPath}` });
  } else if (remote.runtime_paths_status === "0") {
    addCheck(checks, failures, warnings, { id: "runtime_paths", label: "Runtime paths command", status: "fail", detail: runtimeDbPath || "unknown DB path", failure: "Runtime paths command does not report the canonical DB path." });
  } else if (sshResult.ok) {
    addCheck(checks, failures, warnings, { id: "runtime_paths", label: "Runtime paths command", status: "warning", detail: decodeB64(remote.runtime_paths_b64) || "Unavailable.", warning: "Runtime paths command could not be read on the Pi." });
  }

  const status = failures.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY";
  return { status, checks, warnings, failures, endpointPayloads: { health: health.json, state: state.json, tenant: tenant.json }, runtimePaths: runtime.json };
}

function buildReport({ host, user, sshPort, appPath, sshResult, remote, classification }) {
  return {
    checkedAt: new Date().toISOString(),
    status: classification.status,
    target: {
      host,
      userConfigured: Boolean(user),
      sshPort,
      appPath,
      repoLocalDbPath,
      canonicalDbPath,
      canonicalReportsPath,
      canonicalBackupsPath,
      canonicalLogsPath,
      serviceName,
    },
    ssh: {
      attempted: sshResult.attempted,
      ok: sshResult.ok,
      exitCode: sshResult.exitCode,
    },
    remote,
    checks: classification.checks,
    warnings: classification.warnings,
    failures: classification.failures,
    endpointPayloads: classification.endpointPayloads,
    runtimePaths: classification.runtimePaths,
    mutation: "none",
    recommendedNextStep: classification.status === "READY"
      ? "Canonical data path is active. Keep repo-local DB as rollback until backup verification passes."
      : "Complete the interactive DB migration guide, then rerun npm run platform:pi:data:path:verify.",
  };
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [
    "# Sentinel Pi Data Path Verification",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    "",
    "## Paths",
    "",
    `- Repo-local DB: \`${repoLocalDbPath}\``,
    `- Canonical DB: \`${canonicalDbPath}\``,
    `- Canonical reports: \`${canonicalReportsPath}\``,
    `- Canonical backups: \`${canonicalBackupsPath}\``,
    `- Canonical logs: \`${canonicalLogsPath}\``,
    "",
    "## Checks",
    "",
    ...report.checks.map((check) => `- ${check.label}: ${check.status} - ${check.detail}`),
  ];

  if (report.warnings.length) lines.push("", "## Warnings", "", ...report.warnings.map((warning) => `- ${warning}`));
  if (report.failures.length) lines.push("", "## Failures", "", ...report.failures.map((failure) => `- ${failure}`));
  lines.push("", "## Recommended Next Step", "", report.recommendedNextStep, "");

  fs.writeFileSync(markdownReportPath, `${lines.join("\n")}\n`, "utf8");
}

function printReport(report) {
  console.log("Sentinel Pi Data Path Verification");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`Status: ${report.status}`);
  console.log("");
  console.log("Checks:");
  report.checks.forEach((check) => console.log(`- ${check.label}: ${check.status} - ${check.detail}`));

  if (report.warnings.length) {
    console.log("");
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (report.failures.length) {
    console.log("");
    console.log("Failures:");
    report.failures.forEach((failure) => console.log(`- ${failure}`));
  }

  console.log("");
  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const sshResult = runSsh({ host, user, sshPort, appPath });
  const remote = parseRemoteOutput(sshResult.stdout);
  const classification = classify({ host, user, sshResult, remote });
  const report = buildReport({ host, user, sshPort, appPath, sshResult, remote, classification });

  writeReports(report);
  printReport(report);

  if (!sshResult.ok) process.exitCode = 1;
}

main();
