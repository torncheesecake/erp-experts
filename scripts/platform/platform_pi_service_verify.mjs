import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-service-verify.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-service-verify.md");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const serviceName = "sentinel-api.service";
const expectedServicePath = `/etc/systemd/system/${serviceName}`;
const expectedNpmPath = "/usr/local/bin/npm";
const expectedExecStart = `${expectedNpmPath} run platform:api:serve`;
const expectedWorkingDirectory = defaultAppPath;
const expectedEnvFile = `${defaultAppPath}/.env`;
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

function redactSecret(value) {
  return String(value || "")
    .replace(/(https?:\/\/)([^/@\s]+)@/gi, "$1[redacted]@")
    .replace(/([?&](?:token|key|password|secret)=)[^&\s]+/gi, "$1[redacted]")
    .replace(/((?:token|key|password|secret)[\w-]*\s*[=:]\s*)[^\s]+/gi, "$1[redacted]");
}

function marker(name, command) {
  return `printf '__sentinel_${name}__='; ${command} 2>&1 || true; printf '\n'`;
}

function remoteScript({ appPath }) {
  const quotedAppPath = shellQuote(appPath);
  return String.raw`set +e
APP_PATH=${quotedAppPath}
API_HOST=${shellQuote(apiHost)}
API_PORT=${shellQuote(apiPort)}
SERVICE=${shellQuote(serviceName)}

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
  ERR_FILE="$(mktemp /tmp/sentinel-service-verify-curl.XXXXXX.err 2>/dev/null)"
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
emit package_json "$([ -f "$APP_PATH/package.json" ] && printf present || printf missing)"
${marker("branch", "cd \"$APP_PATH\" 2>/dev/null && git branch --show-current")}
${marker("commit", "cd \"$APP_PATH\" 2>/dev/null && git rev-parse --short HEAD")}
${marker("git_status_count", "cd \"$APP_PATH\" 2>/dev/null && git status --short | wc -l | tr -d ' '")}
${marker("git_status_excerpt", "cd \"$APP_PATH\" 2>/dev/null && git status --short | head -n 10 | paste -sd '|' -")}
emit platform_db "$([ -f "$APP_PATH/platform/persistence/platform.db" ] && printf present || printf missing)"
${marker("platform_db_size", "du -h \"$APP_PATH/platform/persistence/platform.db\" 2>/dev/null | cut -f1")}
${marker("service_unit_file", "systemctl list-unit-files \"$SERVICE\" --no-legend 2>/dev/null | awk '{print $1 \":\" $2}'")}
${marker("service_enabled", "systemctl is-enabled \"$SERVICE\" 2>&1")}
${marker("service_active", "systemctl is-active \"$SERVICE\" 2>&1")}
${marker("fragment_path", "systemctl show \"$SERVICE\" -p FragmentPath --value 2>/dev/null")}
${marker("unit_file_state", "systemctl show \"$SERVICE\" -p UnitFileState --value 2>/dev/null")}
${marker("active_state", "systemctl show \"$SERVICE\" -p ActiveState --value 2>/dev/null")}
${marker("exec_start", "systemctl show \"$SERVICE\" -p ExecStart --value 2>/dev/null")}
${marker("working_directory", "systemctl show \"$SERVICE\" -p WorkingDirectory --value 2>/dev/null")}
${marker("environment_files", "systemctl show \"$SERVICE\" -p EnvironmentFiles --value 2>/dev/null")}
${marker("environment", "systemctl show \"$SERVICE\" -p Environment --value 2>/dev/null")}
${marker("listen_addresses", "ss -ltn | awk '$4 ~ /:4317$/ {print $4}' | paste -sd '|' -")}
${marker("sentinel_timers", "systemctl list-timers --all --no-pager 2>/dev/null | grep -i sentinel | paste -sd '|' -")}
SERVICE_CAT="$(systemctl cat "$SERVICE" 2>/dev/null)"
emit_b64 service_cat "$SERVICE_CAT"
curl_endpoint health "http://$API_HOST:$API_PORT/health"
curl_endpoint tenant "http://$API_HOST:$API_PORT/tenant"
curl_endpoint state "http://$API_HOST:$API_PORT/state"
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

function endpointCheck({ name, label, remote, requiredFields = [] }) {
  const status = Number(remote[`${name}_status`] || 99);
  const payload = parseJsonPayload(remote[`${name}_b64`]);
  const errorText = decodeB64(remote[`${name}_error_b64`]);

  if (status !== 0) {
    return {
      check: makeCheck(name, label, "fail", errorText || `curl exited ${status}`),
      payload,
    };
  }

  if (!payload.json) {
    return {
      check: makeCheck(name, label, "fail", "Response was not valid JSON."),
      payload,
    };
  }

  const missing = requiredFields.filter((field) => payload.json[field] === undefined || payload.json[field] === null);
  if (missing.length) {
    return {
      check: makeCheck(name, label, "fail", `Missing expected field(s): ${missing.join(", ")}.`),
      payload,
    };
  }

  return {
    check: makeCheck(name, label, "pass", "Returned JSON."),
    payload,
  };
}

function summariseState(json) {
  if (!json || typeof json !== "object") return "No state JSON returned.";
  const workflow = json.workflow?.state || json.workflowState || "unknown";
  const health = json.health && typeof json.health === "object" ? json.health : {};
  return `Health ${health.monitorStatus || "unknown"}; workflow ${workflow}; QA ${health.pass ?? "?"}/${health.review ?? "?"}/${health.blocked ?? "?"}.`;
}

function summariseTenant(json) {
  if (!json || typeof json !== "object") return "No tenant JSON returned.";
  return `${json.name || json.brandName || "unknown"} (${json.tenantId || "unknown"})`;
}

function listenAddresses(remote) {
  return String(remote.listen_addresses || "")
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isPublicListenAddress(address) {
  return address.includes("0.0.0.0:") || address.includes("[::]:") || address.startsWith("*:") || address.includes(":::4317");
}

function classify({ host, user, sshResult, remote }) {
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
    blockers.push("SSH verification was not attempted because host or user is missing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "Not attempted."));
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only service verification failed.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", redactSecret(sshResult.stderr || sshResult.stdout || "SSH failed.")));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (remote.shell_ok === "shell_ok") {
    checks.push(makeCheck("remote_shell", "Remote shell", "pass", "Read-only checks executed."));
  } else if (sshResult.ok) {
    blockers.push("Remote verification script did not return the expected marker.");
    checks.push(makeCheck("remote_shell", "Remote shell", "fail", "Missing shell marker."));
  }

  if (remote.app_exists === "present") checks.push(makeCheck("app_path", "App path", "pass", remote.app_path || expectedWorkingDirectory));
  else if (sshResult.ok) {
    blockers.push("Pi app path is missing.");
    checks.push(makeCheck("app_path", "App path", "fail", remote.app_path || "Missing."));
  }

  if (remote.git_status_count === "0") checks.push(makeCheck("git_status", "Pi git status clean", "pass", "Clean."));
  else if (remote.git_status_count) {
    blockers.push("Pi checkout has uncommitted tracked changes.");
    checks.push(makeCheck("git_status", "Pi git status clean", "fail", remote.git_status_excerpt || `${remote.git_status_count} changed item(s).`));
  }

  if (remote.service_unit_file) checks.push(makeCheck("service_exists", serviceName, "pass", remote.service_unit_file));
  else if (sshResult.ok) {
    blockers.push(`${serviceName} is not installed.`);
    checks.push(makeCheck("service_exists", serviceName, "fail", "Missing."));
  }

  if (remote.service_enabled === "enabled" || remote.unit_file_state === "enabled") {
    checks.push(makeCheck("service_enabled", "Service enabled", "pass", remote.service_enabled || remote.unit_file_state));
  } else if (sshResult.ok) {
    blockers.push(`${serviceName} is not enabled at boot.`);
    checks.push(makeCheck("service_enabled", "Service enabled", "fail", remote.service_enabled || remote.unit_file_state || "unknown"));
  }

  if (remote.service_active === "active" || remote.active_state === "active") {
    checks.push(makeCheck("service_active", "Service active", "pass", remote.service_active || remote.active_state));
  } else if (sshResult.ok) {
    blockers.push(`${serviceName} is not active.`);
    checks.push(makeCheck("service_active", "Service active", "fail", remote.service_active || remote.active_state || "unknown"));
  }

  if (remote.fragment_path === expectedServicePath) checks.push(makeCheck("fragment_path", "Service file path", "pass", remote.fragment_path));
  else if (sshResult.ok) {
    blockers.push(`Service file path is not ${expectedServicePath}.`);
    checks.push(makeCheck("fragment_path", "Service file path", "fail", remote.fragment_path || "unknown"));
  }

  if (String(remote.exec_start || "").includes(expectedExecStart)) {
    checks.push(makeCheck("exec_start", "ExecStart", "pass", expectedExecStart));
  } else if (sshResult.ok) {
    blockers.push(`ExecStart does not use ${expectedExecStart}.`);
    checks.push(makeCheck("exec_start", "ExecStart", "fail", remote.exec_start || "unknown"));
  }

  if (remote.working_directory === expectedWorkingDirectory) {
    checks.push(makeCheck("working_directory", "WorkingDirectory", "pass", remote.working_directory));
  } else if (sshResult.ok) {
    blockers.push(`WorkingDirectory is not ${expectedWorkingDirectory}.`);
    checks.push(makeCheck("working_directory", "WorkingDirectory", "fail", remote.working_directory || "unknown"));
  }

  if (String(remote.environment_files || "").includes(expectedEnvFile)) {
    checks.push(makeCheck("environment_file", "EnvironmentFile", "pass", expectedEnvFile));
  } else if (sshResult.ok) {
    blockers.push(`EnvironmentFile does not include ${expectedEnvFile}.`);
    checks.push(makeCheck("environment_file", "EnvironmentFile", "fail", remote.environment_files || "unknown"));
  }

  const env = String(remote.environment || "");
  if (env.includes("SENTINEL_API_HOST=127.0.0.1") && env.includes("SENTINEL_API_PORT=4317")) {
    checks.push(makeCheck("environment", "API environment", "pass", "Host and port are localhost-only."));
  } else if (sshResult.ok) {
    blockers.push("Service environment does not force SENTINEL_API_HOST=127.0.0.1 and SENTINEL_API_PORT=4317.");
    checks.push(makeCheck("environment", "API environment", "fail", env || "unknown"));
  }

  const addresses = listenAddresses(remote);
  if (addresses.includes(`${apiHost}:${apiPort}`)) {
    checks.push(makeCheck("listen_localhost", "API listens on localhost", "pass", addresses.join(", ")));
  } else if (sshResult.ok) {
    blockers.push(`API is not listening on ${apiHost}:${apiPort}.`);
    checks.push(makeCheck("listen_localhost", "API listens on localhost", "fail", addresses.join(", ") || "No listener."));
  }

  const publicAddresses = addresses.filter(isPublicListenAddress);
  if (publicAddresses.length) {
    blockers.push(`API is bound publicly: ${publicAddresses.join(", ")}.`);
    checks.push(makeCheck("listen_public", "No public API bind", "fail", publicAddresses.join(", ")));
  } else if (addresses.length) {
    checks.push(makeCheck("listen_public", "No public API bind", "pass", "No 0.0.0.0 or wildcard listener found."));
  }

  const health = endpointCheck({ name: "health", label: "GET /health", remote, requiredFields: ["status", "service"] });
  const tenant = endpointCheck({ name: "tenant", label: "GET /tenant", remote, requiredFields: ["tenantId", "name"] });
  const state = endpointCheck({ name: "state", label: "GET /state", remote, requiredFields: ["tenant", "workflow"] });

  for (const endpoint of [health, tenant, state]) {
    checks.push(endpoint.check);
    if (endpoint.check.status === "fail") blockers.push(`${endpoint.check.label} failed: ${endpoint.check.detail}`);
  }

  if (remote.sentinel_timers) {
    warnings.push(`Sentinel timers were found: ${remote.sentinel_timers}. Confirm they are expected before enabling cadence automation.`);
    checks.push(makeCheck("timers", "Sentinel timers", "warning", remote.sentinel_timers));
  } else if (sshResult.ok) {
    checks.push(makeCheck("timers", "Sentinel timers", "pass", "No Sentinel timers listed."));
  }

  if (remote.platform_db === "present") {
    warnings.push("Platform DB is currently repo-local at platform/persistence/platform.db. Review this before making the Pi the canonical runtime state.");
    checks.push(makeCheck("platform_db_location", "Platform DB location", "warning", `Repo-local DB present${remote.platform_db_size ? ` (${remote.platform_db_size})` : ""}.`));
  }

  warnings.push("Remote auth enforcement is not implemented yet. Keep the API localhost-only and do not add a reverse proxy until auth exists.");
  checks.push(makeCheck("remote_auth", "Remote auth enforcement", "warning", "Not implemented yet."));

  const status = blockers.length ? "SERVICE_NOT_READY" : warnings.length ? "SERVICE_HEALTHY_WITH_WARNINGS" : "SERVICE_HEALTHY";
  return { status, checks, warnings, blockers, endpoints: { health, tenant, state } };
}

function buildReport() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const sshResult = runSsh({ host, user, sshPort, appPath });
  const remote = sshResult.ok ? parseRemoteOutput(sshResult.stdout) : {};
  const classification = classify({ host, user, sshResult, remote });
  const healthJson = classification.endpoints.health.payload.json;
  const tenantJson = classification.endpoints.tenant.payload.json;
  const stateJson = classification.endpoints.state.payload.json;

  return {
    checkedAt: new Date().toISOString(),
    status: classification.status,
    target: { host, sshUser: user, sshPort, appPath, serviceName, expectedServicePath, apiHost, apiPort },
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
      serviceUnitFile: remote.service_unit_file || "missing",
      serviceEnabled: remote.service_enabled || remote.unit_file_state || "unknown",
      serviceActive: remote.service_active || remote.active_state || "unknown",
      fragmentPath: remote.fragment_path || "unknown",
      execStart: remote.exec_start || "unknown",
      workingDirectory: remote.working_directory || "unknown",
      environmentFiles: remote.environment_files || "unknown",
      listenAddresses: listenAddresses(remote),
      sentinelTimers: remote.sentinel_timers || "none",
      platformDbSize: remote.platform_db_size || "unknown",
    },
    endpointResults: {
      health: {
        curlStatus: Number(remote.health_status || 99),
        summary: healthJson ? `${healthJson.service || "unknown"}: ${healthJson.status || "unknown"}` : "No valid health JSON.",
      },
      tenant: {
        curlStatus: Number(remote.tenant_status || 99),
        summary: summariseTenant(tenantJson),
      },
      state: {
        curlStatus: Number(remote.state_status || 99),
        summary: summariseState(stateJson),
      },
    },
    serviceFileExcerpt: decodeB64(remote.service_cat_b64).split(/\r?\n/).slice(0, 80).join("\n"),
    checks: classification.checks,
    warnings: classification.warnings,
    blockers: classification.blockers,
    recommendedNextStep: classification.blockers.length
      ? "Fix service blockers, then rerun npm run platform:pi:service:verify."
      : "Service is healthy. Keep it localhost-only; next work should address canonical DB path and remote auth before any public exposure.",
  };
}

function statusIcon(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi API Service Verification",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- SSH user: ${report.target.sshUser}`,
    `- App path: ${report.target.appPath}`,
    `- Service: ${report.target.serviceName}`,
    `- API bind: ${report.target.apiHost}:${report.target.apiPort}`,
    "",
    "## Service State",
    "",
    `- Unit file: ${report.remote.serviceUnitFile}`,
    `- Enabled: ${report.remote.serviceEnabled}`,
    `- Active: ${report.remote.serviceActive}`,
    `- Fragment: ${report.remote.fragmentPath}`,
    `- ExecStart: ${report.remote.execStart}`,
    `- WorkingDirectory: ${report.remote.workingDirectory}`,
    `- EnvironmentFiles: ${report.remote.environmentFiles}`,
    `- Listen addresses: ${report.remote.listenAddresses.join(", ") || "none"}`,
    `- Sentinel timers: ${report.remote.sentinelTimers}`,
    "",
    "## Endpoint Results",
    "",
    `- /health: ${report.endpointResults.health.summary}`,
    `- /tenant: ${report.endpointResults.tenant.summary}`,
    `- /state: ${report.endpointResults.state.summary}`,
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
    "## Service File Excerpt",
    "",
    report.serviceFileExcerpt ? "```ini" : "No service file excerpt captured.",
    ...(report.serviceFileExcerpt ? [report.serviceFileExcerpt, "```"] : []),
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
  console.log("Sentinel Raspberry Pi API Service Verification");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`Service: ${report.target.serviceName}`);
  console.log(`Status: ${report.status}`);
  console.log("");
  console.log("Service state:");
  console.log(`- Enabled: ${report.remote.serviceEnabled}`);
  console.log(`- Active: ${report.remote.serviceActive}`);
  console.log(`- ExecStart: ${report.remote.execStart}`);
  console.log(`- WorkingDirectory: ${report.remote.workingDirectory}`);
  console.log(`- Listen addresses: ${report.remote.listenAddresses.join(", ") || "none"}`);
  console.log("");
  console.log("Endpoint results:");
  console.log(`- /health: ${report.endpointResults.health.summary}`);
  console.log(`- /tenant: ${report.endpointResults.tenant.summary}`);
  console.log(`- /state: ${report.endpointResults.state.summary}`);
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
  if (report.status === "SERVICE_NOT_READY") process.exitCode = 1;
}

main();
