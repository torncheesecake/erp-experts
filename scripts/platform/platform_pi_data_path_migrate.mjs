import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-data-path-migration.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-data-path-migration.md");
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
const maxOutputChars = 4_000;

function parseArgs(argv) {
  return {
    confirm: argv.includes("--confirm"),
    allowExistingTarget: argv.includes("--allow-existing-target"),
  };
}

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

function redactSecret(value) {
  return String(value || "")
    .replace(/(https?:\/\/)([^/@\s]+)@/gi, "$1[redacted]@")
    .replace(/([?&](?:token|key|password|secret)=)[^&\s]+/gi, "$1[redacted]")
    .replace(/((?:token|key|password|secret)[\w-]*\s*[=:]\s*)[^\s]+/gi, "$1[redacted]");
}

function trimOutput(value) {
  const text = redactSecret(value || "").trim();
  if (text.length <= maxOutputChars) return text;
  return `${text.slice(0, maxOutputChars)}\n[output truncated]`;
}

function marker(name, command) {
  return `printf '__sentinel_${name}__='; ${command} 2>&1 || true; printf '\n'`;
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

function parseMarkers(stdout) {
  const values = {};
  const stepStatuses = [];
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^__sentinel_([^=]+)__=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = redactSecret(rawValue.trim());
    if (key === "step_status") {
      const [id, status, label] = value.split("|");
      stepStatuses.push({ id, status, label });
    } else {
      values[key] = value;
    }
  }

  const stepOutputs = {};
  Object.entries(values).forEach(([key, value]) => {
    const match = key.match(/^step_(.+)_output_b64$/);
    if (match) stepOutputs[match[1]] = trimOutput(decodeB64(value));
  });

  return { values, stepStatuses, stepOutputs };
}

function readOnlyRemoteScript({ appPath }) {
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
  ERR_FILE="$(mktemp /tmp/sentinel-data-path-readonly-curl.XXXXXX.err 2>/dev/null)"
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
${marker("canonical_data_dir", "if [ -d \"$CANONICAL_REPORTS/..\" ]; then echo present; else echo missing; fi")}
${marker("canonical_reports_dir", "if [ -d \"$CANONICAL_REPORTS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_backups_dir", "if [ -d \"$CANONICAL_BACKUPS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_logs_dir", "if [ -d \"$CANONICAL_LOGS\" ]; then echo present; else echo missing; fi")}
${marker("canonical_db_exists", "if [ -f \"$CANONICAL_DB\" ]; then echo present; else echo missing; fi")}
${marker("canonical_db_size", "du -h \"$CANONICAL_DB\" 2>/dev/null | cut -f1")}
${marker("env_file", "if [ -f \"$ENV_FILE\" ]; then echo present; else echo missing; fi")}
${marker("env_platform_db_path", "grep -E '^PLATFORM_DB_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_report_output_path", "grep -E '^PLATFORM_REPORT_OUTPUT_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_backup_path", "grep -E '^PLATFORM_BACKUP_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_log_path", "grep -E '^PLATFORM_LOG_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("service_exists", "systemctl cat \"$SERVICE\" >/dev/null 2>&1 && echo present || echo missing")}
${marker("service_enabled", "systemctl is-enabled \"$SERVICE\" 2>&1")}
${marker("service_active", "systemctl is-active \"$SERVICE\" 2>&1")}
${marker("listen_addresses", "ss -ltn | awk '$4 ~ /:4317$/ {print $4}' | paste -sd '|' -")}
curl_endpoint health "http://$API_HOST:$API_PORT/health"
curl_endpoint tenant "http://$API_HOST:$API_PORT/tenant"
curl_endpoint state "http://$API_HOST:$API_PORT/state"
`;
}

function mutationRemoteScript({ appPath, allowExistingTarget }) {
  const quotedAppPath = shellQuote(appPath);
  const allowExisting = allowExistingTarget ? "1" : "0";
  return String.raw`set -u
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
ALLOW_EXISTING_TARGET=${allowExisting}
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DB="$CANONICAL_BACKUPS/platform-db-pre-migration-$TIMESTAMP.db"
SERVICE_STOPPED=0

emit() {
  printf '__sentinel_%s__=%s\n' "$1" "$2"
}

emit_b64() {
  printf '__sentinel_%s_b64__=' "$1"
  printf '%s' "$2" | base64 | tr -d '\n'
  printf '\n'
}

step_index=0
run_step() {
  step_index=$((step_index + 1))
  step_id="$step_index"
  label="$1"
  command="$2"
  output="$(bash -lc "$command" 2>&1)"
  status=$?
  emit step_status "$step_id|$status|$label"
  emit_b64 "step_${step_id}_output" "$output"
  if [ "$status" -ne 0 ]; then
    if [ "$SERVICE_STOPPED" -eq 1 ]; then
      restart_output="$(sudo -n systemctl start "$SERVICE" 2>&1)"
      restart_status=$?
      emit restart_after_failure_status "$restart_status"
      emit_b64 restart_after_failure_output "$restart_output"
    fi
    exit "$status"
  fi
}

upsert_env() {
  key="$1"
  value="$2"
  file="$ENV_FILE"
  tmp_file="$(mktemp /tmp/sentinel-env.XXXXXX)"
  awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    $0 ~ "^" key "=" {
      print key "=" value
      found = 1
      next
    }
    { print }
    END {
      if (!found) print key "=" value
    }
  ' "$file" > "$tmp_file" && mv "$tmp_file" "$file"
}

curl_endpoint() {
  NAME="$1"
  URL="$2"
  ERR_FILE="$(mktemp /tmp/sentinel-data-path-migrate-curl.XXXXXX.err 2>/dev/null)"
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
  return "$CURL_STATUS"
}

emit backup_db "$BACKUP_DB"
emit target_db "$CANONICAL_DB"

run_step "Verify repo-local source DB exists" "[ -f '$REPO_DB' ]"
run_step "Verify canonical data directory exists" "[ -d '$CANONICAL_REPORTS/..' ]"
run_step "Verify canonical reports directory exists" "[ -d '$CANONICAL_REPORTS' ]"
run_step "Verify canonical backups directory exists" "[ -d '$CANONICAL_BACKUPS' ]"
run_step "Verify canonical logs directory exists" "[ -d '$CANONICAL_LOGS' ]"
run_step "Verify Pi service .env exists" "[ -f '$ENV_FILE' ]"
run_step "Verify sentinel-api.service exists" "systemctl cat '$SERVICE' >/dev/null"
run_step "Verify sentinel-api.service is active before migration" "systemctl is-active --quiet '$SERVICE'"
if [ -f "$CANONICAL_DB" ] && [ "$ALLOW_EXISTING_TARGET" != "1" ]; then
  emit existing_target_refused "$CANONICAL_DB"
  exit 41
fi
run_step "Verify non-interactive sudo is available" "sudo -n true"

run_step "Stop sentinel-api.service" "sudo -n systemctl stop '$SERVICE'"
SERVICE_STOPPED=1
run_step "Back up repo-local DB before migration" "cp '$REPO_DB' '$BACKUP_DB'"
if [ -f "$CANONICAL_DB" ]; then
  emit canonical_copy skipped_existing_target
else
  run_step "Copy DB to canonical runtime path" "cp '$REPO_DB' '$CANONICAL_DB'"
  emit canonical_copy copied
fi
run_step "Update Pi service environment paths" "$(typeset -f upsert_env); ENV_FILE='$ENV_FILE'; upsert_env PLATFORM_DB_PATH '$CANONICAL_DB'; upsert_env PLATFORM_REPORT_OUTPUT_PATH '$CANONICAL_REPORTS'; upsert_env PLATFORM_BACKUP_PATH '$CANONICAL_BACKUPS'; upsert_env PLATFORM_LOG_PATH '$CANONICAL_LOGS'"
run_step "Run platform health with canonical runtime paths" "cd '$APP_PATH' && set -a && . '$ENV_FILE' && set +a && npm run platform:health"
run_step "Restart sentinel-api.service" "sudo -n systemctl start '$SERVICE'"
SERVICE_STOPPED=0
run_step "Confirm sentinel-api.service active after migration" "systemctl is-active --quiet '$SERVICE'"
for i in $(seq 1 20); do
  curl -fsS --max-time 3 "http://$API_HOST:$API_PORT/health" >/dev/null 2>&1 && break
  sleep 1
done
curl_endpoint health "http://$API_HOST:$API_PORT/health" || exit 61
curl_endpoint state "http://$API_HOST:$API_PORT/state" || exit 62
curl_endpoint tenant "http://$API_HOST:$API_PORT/tenant" || exit 63
emit service_active_after "$(systemctl is-active "$SERVICE" 2>&1 || true)"
emit repo_db_left_in_place "$([ -f "$REPO_DB" ] && printf yes || printf no)"
`;
}

function runSsh({ host, user, sshPort, script, timeoutMs = 45_000 }) {
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
    input: script,
    shell: false,
    timeout: timeoutMs,
  });

  return {
    attempted: true,
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function plannedSteps({ allowExistingTarget }) {
  return [
    "Verify sentinel-api.service is active before migration.",
    "Stop sentinel-api.service.",
    `Back up repo-local DB to ${canonicalBackupsPath}/platform-db-pre-migration-<timestamp>.db.`,
    allowExistingTarget
      ? `Use existing ${canonicalDbPath} if already present; otherwise copy the repo-local DB.`
      : `Copy repo-local DB to ${canonicalDbPath} only if the target does not already exist.`,
    "Append or update Pi .env with canonical DB, report, backup and log paths.",
    "Run npm run platform:health with the Pi .env loaded.",
    "Restart sentinel-api.service.",
    "Verify /health, /state and /tenant on 127.0.0.1:4317.",
    "Confirm sentinel-api.service is active.",
    "Leave the repo-local DB untouched as the rollback copy.",
  ];
}

function classifyReadiness({ host, user, sshResult, remote, allowExistingTarget }) {
  const blockers = [];
  const warnings = [];
  const checks = [];

  function add(id, label, status, detail) {
    checks.push({ id, label, status, detail });
  }

  if (!host) {
    blockers.push("RASPBERRY_PI_HOST is missing.");
    add("host", "Host configured", "fail", "Missing.");
  } else {
    add("host", "Host configured", "pass", host);
  }

  if (!user) {
    blockers.push("RASPBERRY_PI_USER is missing.");
    add("user", "User configured", "fail", "Missing.");
  } else {
    add("user", "User configured", "pass", "Configured.");
  }

  if (!sshResult.attempted) {
    blockers.push("SSH was not attempted because host or user is missing.");
    add("ssh", "SSH reachable", "fail", "Not attempted.");
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only preflight failed.");
    add("ssh", "SSH reachable", "fail", trimOutput(sshResult.stderr || sshResult.stdout || "SSH failed."));
  } else {
    add("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded.");
  }

  if (sshResult.ok && remote.shell_ok !== "shell_ok") {
    blockers.push("Remote preflight did not return expected Sentinel markers.");
    add("remote_shell", "Remote shell", "fail", "Missing marker.");
  } else if (remote.shell_ok === "shell_ok") {
    add("remote_shell", "Remote shell", "pass", "Read-only checks executed.");
  }

  if (remote.repo_db_exists === "present") add("repo_db", "Repo-local DB", "pass", `Present${remote.repo_db_size ? ` (${remote.repo_db_size})` : ""}.`);
  else if (sshResult.ok) {
    blockers.push(`Repo-local source DB is missing: ${repoLocalDbPath}`);
    add("repo_db", "Repo-local DB", "fail", "Missing.");
  }

  for (const [key, label] of [
    ["canonical_data_dir", "Canonical data directory"],
    ["canonical_reports_dir", "Canonical reports directory"],
    ["canonical_backups_dir", "Canonical backups directory"],
    ["canonical_logs_dir", "Canonical logs directory"],
  ]) {
    if (remote[key] === "present") add(key, label, "pass", "Present.");
    else if (sshResult.ok) {
      blockers.push(`${label} is missing.`);
      add(key, label, "fail", "Missing.");
    }
  }

  if (remote.canonical_db_exists === "present") {
    const detail = `Present${remote.canonical_db_size ? ` (${remote.canonical_db_size})` : ""}.`;
    if (allowExistingTarget) {
      warnings.push("Canonical DB already exists; confirmed mode would not overwrite it.");
      add("canonical_db", "Canonical DB", "warning", detail);
    } else {
      blockers.push(`Canonical DB already exists: ${canonicalDbPath}. Use --allow-existing-target only after reviewing it.`);
      add("canonical_db", "Canonical DB", "fail", detail);
    }
  } else if (sshResult.ok) {
    add("canonical_db", "Canonical DB", "pass", "Missing, ready for first copy.");
  }

  if (remote.env_file === "present") add("env_file", "Pi service .env", "pass", `${defaultAppPath}/.env`);
  else if (sshResult.ok) {
    blockers.push("Pi service .env is missing.");
    add("env_file", "Pi service .env", "fail", "Missing.");
  }

  if (remote.service_exists === "present") add("service_exists", "sentinel-api.service installed", "pass", "Present.");
  else if (sshResult.ok) {
    blockers.push("sentinel-api.service is not installed.");
    add("service_exists", "sentinel-api.service installed", "fail", "Missing.");
  }

  if (remote.service_active === "active") add("service_active", "Service active before migration", "pass", "active");
  else if (sshResult.ok) {
    blockers.push("sentinel-api.service is not active before migration.");
    add("service_active", "Service active before migration", "fail", remote.service_active || "unknown");
  }

  if (remote.listen_addresses && !remote.listen_addresses.split("|").includes("127.0.0.1:4317")) {
    warnings.push(`Unexpected API listener state: ${remote.listen_addresses}`);
    add("listener", "API listener", "warning", remote.listen_addresses);
  } else if (remote.listen_addresses) {
    add("listener", "API listener", "pass", remote.listen_addresses);
  }

  const health = parseJsonPayload(remote.health_b64);
  if (remote.health_status === "0" && health.json?.status === "ok") {
    add("health", "Current API health", "pass", "ok");
  } else if (sshResult.ok) {
    warnings.push("Current API health endpoint was not healthy during dry-run preflight.");
    add("health", "Current API health", "warning", decodeB64(remote.health_error_b64) || "Unavailable.");
  }

  return {
    status: blockers.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY_FOR_CONFIRM",
    blockers,
    warnings,
    checks,
  };
}

function buildReport({ args, host, user, sshPort, appPath, readOnlyResult, parsedReadOnly, readiness, mutationResult = null, parsedMutation = null }) {
  const mutationValues = parsedMutation?.values || {};
  const endpointChecks = {
    health: mutationValues.health_status === "0" ? parseJsonPayload(mutationValues.health_b64).json : null,
    state: mutationValues.state_status === "0" ? parseJsonPayload(mutationValues.state_b64).json : null,
    tenant: mutationValues.tenant_status === "0" ? parseJsonPayload(mutationValues.tenant_b64).json : null,
  };
  const mutationFailed = mutationResult && !mutationResult.ok;
  const confirmedStatus = mutationResult
    ? mutationResult.ok
      ? "MIGRATION_COMPLETE"
      : "MIGRATION_FAILED"
    : readiness.status;

  return {
    generatedAt: new Date().toISOString(),
    mode: args.confirm ? "confirmed" : "dry-run",
    status: args.confirm ? confirmedStatus : readiness.status,
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
    safety: {
      confirmed: args.confirm,
      allowExistingTarget: args.allowExistingTarget,
      apiExposureChanged: false,
      reverseProxyChanged: false,
      timersChanged: false,
      repoLocalDbLeftAsRollbackCopy: args.confirm ? mutationValues.repo_db_left_in_place === "yes" : true,
    },
    dryRunPreflight: {
      attempted: readOnlyResult.attempted,
      ok: readOnlyResult.ok,
      exitCode: readOnlyResult.exitCode,
      remote: parsedReadOnly.values,
      checks: readiness.checks,
      warnings: readiness.warnings,
      blockers: readiness.blockers,
    },
    plannedSteps: plannedSteps(args),
    confirmedRun: mutationResult ? {
      attempted: mutationResult.attempted,
      ok: mutationResult.ok,
      exitCode: mutationResult.exitCode,
      backupPath: mutationValues.backup_db || null,
      targetDbPath: mutationValues.target_db || canonicalDbPath,
      envUpdateSummary: "PLATFORM_DB_PATH, PLATFORM_REPORT_OUTPUT_PATH, PLATFORM_BACKUP_PATH and PLATFORM_LOG_PATH updated in Pi .env.",
      canonicalCopy: mutationValues.canonical_copy || null,
      serviceRestartResult: mutationValues.service_active_after || null,
      restartAfterFailureStatus: mutationValues.restart_after_failure_status || null,
      restartAfterFailureOutput: decodeB64(mutationValues.restart_after_failure_output_b64),
      endpointChecks,
      stepsRun: parsedMutation.stepStatuses.map((step) => ({
        ...step,
        outputExcerpt: parsedMutation.stepOutputs[step.id] || "",
      })),
      stdoutExcerpt: trimOutput(mutationResult.stdout),
      stderrExcerpt: trimOutput(mutationResult.stderr),
    } : null,
    rollbackNote: "The repo-local DB is intentionally left in place as a rollback copy. If the service fails, restore the previous Pi .env and restart sentinel-api.service against the repo-local DB.",
    warnings: [
      ...readiness.warnings,
      ...(mutationFailed ? ["Confirmed migration failed. Review confirmedRun and service state before retrying."] : []),
    ],
    errors: [
      ...readiness.blockers,
      ...(mutationResult && !mutationResult.ok ? [trimOutput(mutationResult.stderr || mutationResult.stdout || "Remote migration failed.")] : []),
    ],
  };
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [
    "# Sentinel Pi Data Path Migration",
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Status: ${report.status}`,
    "",
    "## Target Paths",
    "",
    `- Repo-local DB: \`${repoLocalDbPath}\``,
    `- Canonical DB: \`${canonicalDbPath}\``,
    `- Canonical reports: \`${canonicalReportsPath}\``,
    `- Canonical backups: \`${canonicalBackupsPath}\``,
    `- Canonical logs: \`${canonicalLogsPath}\``,
    "",
    "## Planned Steps",
    "",
    ...report.plannedSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Dry-run Preflight Checks",
    "",
    ...report.dryRunPreflight.checks.map((check) => `- ${check.label}: ${check.status} - ${check.detail}`),
  ];

  if (report.confirmedRun) {
    lines.push(
      "",
      "## Confirmed Run",
      "",
      `- Backup path: \`${report.confirmedRun.backupPath || "not created"}\``,
      `- Canonical copy: ${report.confirmedRun.canonicalCopy || "unknown"}`,
      `- Service restart: ${report.confirmedRun.serviceRestartResult || "unknown"}`,
      `- Health endpoint: ${report.confirmedRun.endpointChecks.health ? "ok" : "not verified"}`,
      `- State endpoint: ${report.confirmedRun.endpointChecks.state ? "ok" : "not verified"}`,
      `- Tenant endpoint: ${report.confirmedRun.endpointChecks.tenant ? "ok" : "not verified"}`,
      "",
      "### Steps Run",
      "",
      ...report.confirmedRun.stepsRun.map((step) => `- ${step.label}: ${step.status === "0" ? "pass" : `fail (${step.status})`}`),
    );
  }

  if (report.warnings.length) {
    lines.push("", "## Warnings", "", ...report.warnings.map((warning) => `- ${warning}`));
  }

  if (report.errors.length) {
    lines.push("", "## Errors", "", ...report.errors.map((error) => `- ${error}`));
  }

  lines.push("", "## Rollback Note", "", report.rollbackNote, "");
  fs.writeFileSync(markdownReportPath, `${lines.join("\n")}\n`, "utf8");
}

function printReport(report) {
  console.log("Sentinel Pi Data Path Migration");
  console.log("");
  console.log(`Mode: ${report.mode}`);
  console.log(`Host: ${report.target.host}`);
  console.log(`Status: ${report.status}`);
  console.log("");
  console.log("Planned steps:");
  report.plannedSteps.forEach((step, index) => console.log(`${index + 1}. ${step}`));
  console.log("");
  console.log("Preflight checks:");
  report.dryRunPreflight.checks.forEach((check) => {
    console.log(`- ${check.label}: ${check.status} - ${check.detail}`);
  });

  if (report.confirmedRun) {
    console.log("");
    console.log("Confirmed run:");
    console.log(`- Backup path: ${report.confirmedRun.backupPath || "not created"}`);
    console.log(`- Canonical copy: ${report.confirmedRun.canonicalCopy || "unknown"}`);
    console.log(`- Service restart: ${report.confirmedRun.serviceRestartResult || "unknown"}`);
    console.log(`- Health endpoint: ${report.confirmedRun.endpointChecks.health ? "ok" : "not verified"}`);
    console.log(`- State endpoint: ${report.confirmedRun.endpointChecks.state ? "ok" : "not verified"}`);
    console.log(`- Tenant endpoint: ${report.confirmedRun.endpointChecks.tenant ? "ok" : "not verified"}`);
  } else {
    console.log("");
    console.log("Mutation: none. Re-run with --confirm only after reviewing this dry-run.");
  }

  if (report.warnings.length) {
    console.log("");
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (report.errors.length) {
    console.log("");
    console.log("Errors:");
    report.errors.forEach((error) => console.log(`- ${error}`));
  }

  console.log("");
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);

  const readOnlyResult = runSsh({
    host,
    user,
    sshPort,
    script: readOnlyRemoteScript({ appPath }),
  });
  const parsedReadOnly = parseMarkers(readOnlyResult.stdout);
  const readiness = classifyReadiness({
    host,
    user,
    sshResult: readOnlyResult,
    remote: parsedReadOnly.values,
    allowExistingTarget: args.allowExistingTarget,
  });

  let mutationResult = null;
  let parsedMutation = null;

  if (args.confirm) {
    if (readiness.blockers.length) {
      const report = buildReport({ args, host, user, sshPort, appPath, readOnlyResult, parsedReadOnly, readiness });
      writeReports(report);
      printReport(report);
      process.exit(1);
    }

    mutationResult = runSsh({
      host,
      user,
      sshPort,
      script: mutationRemoteScript({ appPath, allowExistingTarget: args.allowExistingTarget }),
      timeoutMs: 3 * 60_000,
    });
    parsedMutation = parseMarkers(mutationResult.stdout);
  }

  const report = buildReport({
    args,
    host,
    user,
    sshPort,
    appPath,
    readOnlyResult,
    parsedReadOnly,
    readiness,
    mutationResult,
    parsedMutation,
  });

  writeReports(report);
  printReport(report);

  if (report.status === "NOT_READY" || report.status === "MIGRATION_FAILED") {
    process.exitCode = 1;
  }
}

main();
