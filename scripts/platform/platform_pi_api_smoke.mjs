import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-api-smoke.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-api-smoke.md");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const apiHost = "127.0.0.1";
const apiPort = "4317";
const maxOutputChars = 12_000;

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
  const text = redactSecret(value || "");
  if (text.length <= maxOutputChars) return text;
  return `${text.slice(0, maxOutputChars)}\n[output truncated]`;
}

function remoteScript({ appPath }) {
  return String.raw`set +e
APP_PATH=${shellQuote(appPath)}
API_HOST=${shellQuote(apiHost)}
API_PORT=${shellQuote(apiPort)}
API_PID=""
LOG_FILE=""
CLEANUP_ATTEMPTED="no"
CLEANUP_RESULT="not_needed"

emit() {
  printf '__sentinel_%s__=%s\n' "$1" "$2"
}

emit_b64() {
  printf '__sentinel_%s_b64__=' "$1"
  printf '%s' "$2" | base64 | tr -d '\n'
  printf '\n'
}

port_status() {
  (timeout 1 bash -c "</dev/tcp/$API_HOST/$API_PORT" >/dev/null 2>&1 && printf 'open') || printf 'closed'
}

cleanup_api() {
  if [ -n "$API_PID" ]; then
    CLEANUP_ATTEMPTED="yes"
    kill -TERM "-$API_PID" >/dev/null 2>&1 || kill "$API_PID" >/dev/null 2>&1 || true
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      if [ "$(port_status)" = "closed" ]; then
        CLEANUP_RESULT="stopped"
        return
      fi
      sleep 0.5
    done
    kill -KILL "-$API_PID" >/dev/null 2>&1 || kill -KILL "$API_PID" >/dev/null 2>&1 || true
    for _ in 1 2 3 4 5; do
      if [ "$(port_status)" = "closed" ]; then
        CLEANUP_RESULT="forced_stop"
        return
      fi
      sleep 0.5
    done
    if [ "$(port_status)" = "closed" ]; then
      CLEANUP_RESULT="forced_stop"
    else
      CLEANUP_RESULT="failed_port_open"
    fi
  fi
}

trap 'cleanup_api >/dev/null 2>&1 || true' EXIT

curl_endpoint() {
  NAME="$1"
  URL="$2"
  ERR_FILE="$(mktemp /tmp/sentinel-api-smoke-curl.XXXXXX.err 2>/dev/null)"
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

if [ ! -d "$APP_PATH" ]; then
  emit pre_existing_port "$(port_status)"
  emit started no
  emit port_ready no
  emit cleanup_attempted no
  emit cleanup_result app_path_missing
  emit port_after_cleanup "$(port_status)"
  exit 0
fi

PRE_PORT="$(port_status)"
emit pre_existing_port "$PRE_PORT"

if [ "$PRE_PORT" = "open" ]; then
  emit started no
  emit port_ready already_open
  curl_endpoint health "http://$API_HOST:$API_PORT/health"
  curl_endpoint state "http://$API_HOST:$API_PORT/state"
  curl_endpoint tenant "http://$API_HOST:$API_PORT/tenant"
  emit cleanup_attempted no
  emit cleanup_result pre_existing_process_not_touched
  emit port_after_cleanup "$(port_status)"
  exit 0
fi

LOG_FILE="$(mktemp /tmp/sentinel-api-smoke.XXXXXX.log 2>/dev/null)"
cd "$APP_PATH" || {
  emit started no
  emit port_ready no
  emit cleanup_attempted no
  emit cleanup_result cd_failed
  emit port_after_cleanup "$(port_status)"
  exit 0
}

setsid env SENTINEL_API_HOST="$API_HOST" SENTINEL_API_PORT="$API_PORT" npm run platform:api:serve >"$LOG_FILE" 2>&1 &
API_PID=$!
emit started yes
emit pid "$API_PID"

PORT_READY="no"
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  if [ "$(port_status)" = "open" ]; then
    PORT_READY="yes"
    break
  fi
  if ! kill -0 "$API_PID" >/dev/null 2>&1; then
    PORT_READY="process_exited"
    break
  fi
  sleep 0.5
done

emit port_ready "$PORT_READY"

if [ "$PORT_READY" = "yes" ]; then
  curl_endpoint health "http://$API_HOST:$API_PORT/health"
  curl_endpoint state "http://$API_HOST:$API_PORT/state"
  curl_endpoint tenant "http://$API_HOST:$API_PORT/tenant"
else
  emit health_status 99
  emit state_status 99
  emit tenant_status 99
fi

cleanup_api
sleep 0.5
emit cleanup_attempted "$CLEANUP_ATTEMPTED"
emit cleanup_result "$CLEANUP_RESULT"
emit port_after_cleanup "$(port_status)"
if [ -n "$LOG_FILE" ] && [ -f "$LOG_FILE" ]; then
  emit_b64 log_excerpt "$(sed -n '1,120p' "$LOG_FILE" 2>/dev/null)"
  rm -f "$LOG_FILE" >/dev/null 2>&1 || true
fi
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
    timeout: 90_000,
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

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function summariseState(json) {
  if (!json || typeof json !== "object") return "No state JSON returned.";
  const workflow = json.workflowState || json.workflow?.state || json.state?.workflowState || "unknown";
  const healthValue = json.health || json.monitor?.health || json.status || "unknown";
  const health = healthValue && typeof healthValue === "object"
    ? healthValue.monitorStatus || healthValue.status || "unknown"
    : healthValue;
  const qa = json.qa || json.qaTotals || json.resourceQa || null;
  const qaSource = qa || (healthValue && typeof healthValue === "object" ? healthValue : null);
  const qaSummary = qaSource && typeof qaSource === "object"
    ? ` QA ${qaSource.pass ?? qaSource.passing ?? "?"}/${qaSource.needs_review ?? qaSource.needsReview ?? qaSource.review ?? "?"}/${qaSource.blocked ?? "?"}.`
    : "";
  return `Health ${health}; workflow ${workflow}.${qaSummary}`;
}

function summariseTenant(json) {
  if (!json || typeof json !== "object") return "No tenant JSON returned.";
  const tenantId = json.tenantId || "unknown";
  const name = json.name || json.brandName || "unknown";
  return `${name} (${tenantId})`;
}

function endpointCheck({ name, label, remote, requiredJsonFields = [] }) {
  const status = Number(remote[`${name}_status`] || 99);
  const payload = parseJsonPayload(remote[`${name}_b64`]);
  const errorText = decodeB64(remote[`${name}_error_b64`]);

  if (status !== 0) {
    return {
      check: makeCheck(name, label, "fail", errorText || `curl exited ${status}`),
      payload,
      errorText,
    };
  }

  if (!payload.json) {
    return {
      check: makeCheck(name, label, "fail", "Response was not valid JSON."),
      payload,
      errorText,
    };
  }

  const missing = requiredJsonFields.filter((field) => payload.json[field] === undefined || payload.json[field] === null);
  if (missing.length) {
    return {
      check: makeCheck(name, label, "fail", `Missing expected field(s): ${missing.join(", ")}.`),
      payload,
      errorText,
    };
  }

  return {
    check: makeCheck(name, label, "pass", "Returned JSON."),
    payload,
    errorText,
  };
}

function classify({ host, user, sshResult, remote }) {
  const checks = [];
  const warnings = [];
  const failures = [];

  if (!host) {
    failures.push("RASPBERRY_PI_HOST is missing from local environment or .env.");
    checks.push(makeCheck("host", "Host configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("host", "Host configured", "pass", host));
  }

  if (!user) {
    failures.push("RASPBERRY_PI_USER is missing from local environment or .env.");
    checks.push(makeCheck("user", "User configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("user", "User configured", "pass", "Configured."));
  }

  if (!sshResult.attempted) {
    failures.push("SSH smoke was not attempted because host or user is missing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "Not attempted."));
  } else if (!sshResult.ok) {
    failures.push("SSH smoke command failed before endpoint checks completed.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", trimOutput(sshResult.stderr || sshResult.stdout || "SSH failed.")));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (sshResult.ok && remote.shell_ok !== "shell_ok") {
    failures.push("Remote smoke script did not return the expected shell marker.");
    checks.push(makeCheck("shell", "Remote shell", "fail", "Missing shell marker."));
  } else if (remote.shell_ok === "shell_ok") {
    checks.push(makeCheck("shell", "Remote shell", "pass", "Smoke script executed."));
  }

  if (remote.app_exists === "present") {
    checks.push(makeCheck("app_path", "App path", "pass", remote.app_path || "Present."));
  } else if (sshResult.ok) {
    failures.push("Pi app path is missing. Repo deployment must complete before API smoke testing.");
    checks.push(makeCheck("app_path", "App path", "fail", remote.app_path || "Missing."));
  }

  if (remote.pre_existing_port === "open") {
    warnings.push(`Port ${apiPort} was already open before smoke testing. The command did not kill any pre-existing process.`);
    checks.push(makeCheck("pre_existing_port", `Pre-smoke port ${apiPort}`, "warning", "Already open."));
  } else if (remote.pre_existing_port === "closed") {
    checks.push(makeCheck("pre_existing_port", `Pre-smoke port ${apiPort}`, "pass", "Closed before smoke."));
  }

  if (remote.started === "yes") {
    checks.push(makeCheck("started", "Temporary API start", "pass", `Started transient process ${remote.pid || "unknown"}.`));
  } else if (remote.pre_existing_port === "open") {
    checks.push(makeCheck("started", "Temporary API start", "warning", "Skipped because port was already open."));
  } else if (sshResult.ok) {
    failures.push("Temporary API process was not started.");
    checks.push(makeCheck("started", "Temporary API start", "fail", "Not started."));
  }

  if (remote.port_ready === "yes" || remote.port_ready === "already_open") {
    checks.push(makeCheck("port_ready", `Port ${apiPort} ready`, remote.port_ready === "already_open" ? "warning" : "pass", remote.port_ready));
  } else if (sshResult.ok && remote.app_exists === "present") {
    failures.push(`Sentinel API did not become reachable on ${apiHost}:${apiPort}.`);
    checks.push(makeCheck("port_ready", `Port ${apiPort} ready`, "fail", remote.port_ready || "not ready"));
  }

  const health = endpointCheck({ name: "health", label: "GET /health", remote, requiredJsonFields: ["status", "service"] });
  const state = endpointCheck({ name: "state", label: "GET /state", remote });
  const tenant = endpointCheck({ name: "tenant", label: "GET /tenant", remote, requiredJsonFields: ["tenantId", "name"] });

  for (const endpoint of [health, state, tenant]) {
    if (sshResult.ok && (remote.port_ready === "yes" || remote.port_ready === "already_open")) {
      checks.push(endpoint.check);
      if (endpoint.check.status === "fail") failures.push(`${endpoint.check.label} failed: ${endpoint.check.detail}`);
    }
  }

  if (remote.started === "yes") {
    if (remote.cleanup_attempted === "yes" && ["stopped", "forced_stop"].includes(remote.cleanup_result)) {
      checks.push(makeCheck("cleanup", "Temporary API cleanup", "pass", remote.cleanup_result));
    } else {
      failures.push("Temporary API cleanup did not report a clean stop.");
      checks.push(makeCheck("cleanup", "Temporary API cleanup", "fail", remote.cleanup_result || "unknown"));
    }

    if (remote.port_after_cleanup === "closed") {
      checks.push(makeCheck("port_after_cleanup", `Post-cleanup port ${apiPort}`, "pass", "Closed."));
    } else {
      failures.push(`Port ${apiPort} remained open after cleanup.`);
      checks.push(makeCheck("port_after_cleanup", `Post-cleanup port ${apiPort}`, "fail", remote.port_after_cleanup || "unknown"));
    }
  } else if (remote.pre_existing_port === "open") {
    checks.push(makeCheck("cleanup", "Temporary API cleanup", "warning", remote.cleanup_result || "Pre-existing process not touched."));
  }

  const status = failures.length ? "fail" : warnings.length ? "warning" : "pass";
  return { status, checks, warnings, failures, endpointPayloads: { health, state, tenant } };
}

function buildReport() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const sshResult = runSsh({ host, user, sshPort, appPath });
  const remote = sshResult.ok ? parseRemoteOutput(sshResult.stdout) : {};
  const classification = classify({ host, user, sshResult, remote });
  const healthJson = classification.endpointPayloads.health.payload.json;
  const stateJson = classification.endpointPayloads.state.payload.json;
  const tenantJson = classification.endpointPayloads.tenant.payload.json;

  return {
    checkedAt: new Date().toISOString(),
    status: classification.status,
    target: { host, sshUser: user, sshPort, appPath, apiHost, apiPort },
    ssh: {
      attempted: sshResult.attempted,
      ok: sshResult.ok,
      exitCode: sshResult.exitCode,
      stderr: trimOutput(sshResult.stderr.trim()),
    },
    execution: {
      preExistingPortOpen: remote.pre_existing_port === "open",
      started: remote.started === "yes",
      pid: remote.pid || "",
      portReady: remote.port_ready || "unknown",
      cleanupAttempted: remote.cleanup_attempted || "unknown",
      cleanupResult: remote.cleanup_result || "unknown",
      portAfterCleanup: remote.port_after_cleanup || "unknown",
    },
    endpointResults: {
      health: {
        curlStatus: Number(remote.health_status || 99),
        summary: healthJson ? `${healthJson.service || "unknown"}: ${healthJson.status || "unknown"}` : "No valid health JSON.",
      },
      state: {
        curlStatus: Number(remote.state_status || 99),
        summary: summariseState(stateJson),
      },
      tenant: {
        curlStatus: Number(remote.tenant_status || 99),
        summary: summariseTenant(tenantJson),
      },
    },
    logExcerpt: trimOutput(decodeB64(remote.log_excerpt_b64)),
    checks: classification.checks,
    warnings: classification.warnings,
    failures: classification.failures,
    recommendedNextStep: classification.failures.length
      ? "Fix the foreground API smoke blockers, then rerun npm run platform:pi:api:smoke before service installation."
      : "Foreground API smoke passed. Keep the API stopped, then plan the systemd service installation as a separate controlled step.",
  };
}

function statusIcon(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Foreground API Smoke",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- SSH user: ${report.target.sshUser}`,
    `- App path: ${report.target.appPath}`,
    `- API bind: ${report.target.apiHost}:${report.target.apiPort}`,
    "",
    "## Execution",
    "",
    `- Pre-existing port open: ${report.execution.preExistingPortOpen ? "yes" : "no"}`,
    `- Started temporary API: ${report.execution.started ? "yes" : "no"}`,
    `- Port ready: ${report.execution.portReady}`,
    `- Cleanup attempted: ${report.execution.cleanupAttempted}`,
    `- Cleanup result: ${report.execution.cleanupResult}`,
    `- Port after cleanup: ${report.execution.portAfterCleanup}`,
    "",
    "## Endpoint Results",
    "",
    `- /health: ${report.endpointResults.health.summary}`,
    `- /state: ${report.endpointResults.state.summary}`,
    `- /tenant: ${report.endpointResults.tenant.summary}`,
    "",
    "## Checks",
    "",
    ...report.checks.map((check) => `- ${statusIcon(check.status)}: ${check.label} - ${check.detail}`),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Failures",
    "",
    ...(report.failures.length ? report.failures.map((failure) => `- ${failure}`) : ["- None"]),
    "",
    "## API Log Excerpt",
    "",
    report.logExcerpt ? "```text" : "No log excerpt captured.",
    ...(report.logExcerpt ? [report.logExcerpt, "```"] : []),
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
  console.log("Sentinel Raspberry Pi Foreground API Smoke");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`App path: ${report.target.appPath}`);
  console.log(`API bind: ${report.target.apiHost}:${report.target.apiPort}`);
  console.log(`Status: ${report.status}`);
  console.log("");
  console.log("Execution:");
  console.log(`- Pre-existing port open: ${report.execution.preExistingPortOpen ? "yes" : "no"}`);
  console.log(`- Started temporary API: ${report.execution.started ? "yes" : "no"}`);
  console.log(`- Port ready: ${report.execution.portReady}`);
  console.log(`- Cleanup result: ${report.execution.cleanupResult}`);
  console.log(`- Port after cleanup: ${report.execution.portAfterCleanup}`);
  console.log("");
  console.log("Endpoint results:");
  console.log(`- /health: ${report.endpointResults.health.summary}`);
  console.log(`- /state: ${report.endpointResults.state.summary}`);
  console.log(`- /tenant: ${report.endpointResults.tenant.summary}`);
  console.log("");

  if (report.warnings.length) {
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
    console.log("");
  }

  if (report.failures.length) {
    console.log("Failures:");
    report.failures.forEach((failure) => console.log(`- ${failure}`));
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
  if (report.status === "fail") process.exitCode = 1;
}

main();
