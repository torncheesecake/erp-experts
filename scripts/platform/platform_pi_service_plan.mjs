import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-service-plan.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-service-plan.md");
const envPath = path.join(repoRoot, ".env");
const smokeReportPath = path.join(reportsDir, "sentinel-pi-api-smoke.json");
const templatePath = path.join(repoRoot, "deploy/systemd/sentinel-api.service.example");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const serviceName = "sentinel-api.service";
const apiHost = "127.0.0.1";
const apiPort = "4317";
const expectedEnvFile = `${defaultAppPath}/.env`;
const expectedServicePath = `/etc/systemd/system/${serviceName}`;

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
printf '__sentinel_shell_ok__=shell_ok
'
printf '__sentinel_hostname__='; hostname 2>&1 || true
printf '__sentinel_user__='; id -un 2>&1 || true
printf '__sentinel_app_path__=%s
' "$APP_PATH"
printf '__sentinel_app_exists__='; if [ -d "$APP_PATH" ]; then echo present; else echo missing; fi
printf '__sentinel_package_json__='; if [ -f "$APP_PATH/package.json" ]; then echo present; else echo missing; fi
${marker("script_platform_api_serve", "cd \"$APP_PATH\" 2>/dev/null && node -e 'const p=require(\"./package.json\"); process.stdout.write(p.scripts && p.scripts[\"platform:api:serve\"] ? \"present\" : \"missing\")'")}
${marker("node_path", "command -v node")}
${marker("npm_path", "command -v npm")}
${marker("node_version", "node -v")}
${marker("npm_version", "npm -v")}
${marker("systemd_version", "systemctl --version | head -n 1")}
printf '__sentinel_api_port__='; (timeout 1 bash -c "</dev/tcp/${apiHost}/${apiPort}" >/dev/null 2>&1 && echo open) || echo closed
printf '__sentinel_service_unit_file__='; systemctl list-unit-files ${serviceName} --no-legend 2>/dev/null | awk '{print $1 ":" $2}' || true; printf '\n'
printf '__sentinel_service_active__='; systemctl is-active ${serviceName} 2>&1 || true
printf '__sentinel_installed_service_file__='; if [ -f ${shellQuote(expectedServicePath)} ]; then echo present; else echo missing; fi
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

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function templateValue(template, key) {
  const match = template.match(new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function loadTemplateSummary(remoteNpmPath) {
  const exists = fs.existsSync(templatePath);
  const content = exists ? fs.readFileSync(templatePath, "utf8") : "";
  const expectedNpmPath = remoteNpmPath || "/usr/local/bin/npm";
  const checks = [];
  const blockers = [];
  const warnings = [];

  if (!exists) {
    blockers.push("Missing local service template deploy/systemd/sentinel-api.service.example.");
    checks.push(makeCheck("template_exists", "Service template exists", "fail", "Missing."));
    return { exists, content, expectedNpmPath, checks, blockers, warnings, values: {} };
  }

  checks.push(makeCheck("template_exists", "Service template exists", "pass", "deploy/systemd/sentinel-api.service.example"));

  const values = {
    workingDirectory: templateValue(content, "WorkingDirectory"),
    environmentFile: templateValue(content, "EnvironmentFile"),
    apiHost: templateValue(content, "Environment"),
    execStart: templateValue(content, "ExecStart"),
    user: templateValue(content, "User"),
    group: templateValue(content, "Group"),
  };

  const requiredSnippets = [
    ["working_directory", "WorkingDirectory", `WorkingDirectory=${defaultAppPath}`],
    ["environment_file", "EnvironmentFile", `EnvironmentFile=${expectedEnvFile}`],
    ["api_host", "SENTINEL_API_HOST", `Environment=SENTINEL_API_HOST=${apiHost}`],
    ["api_port", "SENTINEL_API_PORT", `Environment=SENTINEL_API_PORT=${apiPort}`],
    ["tenant", "PLATFORM_TENANT", "Environment=PLATFORM_TENANT=erp-experts"],
    ["restart", "Restart policy", "Restart=on-failure"],
  ];

  for (const [id, label, snippet] of requiredSnippets) {
    if (content.includes(snippet)) {
      checks.push(makeCheck(id, label, "pass", snippet));
    } else {
      blockers.push(`Service template missing expected ${label}: ${snippet}`);
      checks.push(makeCheck(id, label, "fail", `Expected ${snippet}`));
    }
  }

  const expectedExecStart = `ExecStart=${expectedNpmPath} run platform:api:serve`;
  if (content.includes(expectedExecStart)) {
    checks.push(makeCheck("exec_start", "ExecStart npm path", "pass", expectedExecStart));
  } else {
    blockers.push(`Service template ExecStart should use Pi npm path: ${expectedExecStart}`);
    checks.push(makeCheck("exec_start", "ExecStart npm path", "fail", `Expected ${expectedExecStart}`));
  }

  if (!content.includes("Environment=PATH=/usr/local/bin:/usr/bin:/bin")) {
    warnings.push("Service template does not set an explicit PATH. ExecStart is absolute, so this is not a blocker.");
    checks.push(makeCheck("path_environment", "Service PATH", "warning", "No explicit PATH."));
  } else {
    checks.push(makeCheck("path_environment", "Service PATH", "pass", "Explicit PATH present."));
  }

  return { exists, content, expectedNpmPath, checks, blockers, warnings, values };
}

function classify({ host, user, sshResult, remote, smokeReport, template }) {
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
    blockers.push("SSH planning checks were not attempted because host or user is missing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "Not attempted."));
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only service planning checks failed.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", redactSecret(sshResult.stderr || sshResult.stdout || "SSH failed.")));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (remote.shell_ok === "shell_ok") {
    checks.push(makeCheck("remote_shell", "Remote shell", "pass", "Read-only checks executed."));
  } else if (sshResult.ok) {
    blockers.push("Remote service planning script did not return the expected marker.");
    checks.push(makeCheck("remote_shell", "Remote shell", "fail", "Missing shell marker."));
  }

  if (remote.app_exists === "present") checks.push(makeCheck("app_path", "App path", "pass", remote.app_path || defaultAppPath));
  else if (sshResult.ok) {
    blockers.push("Pi app path is missing. Repo deployment must be verified before service installation.");
    checks.push(makeCheck("app_path", "App path", "fail", remote.app_path || "Missing."));
  }

  if (remote.package_json === "present") checks.push(makeCheck("package_json", "package.json", "pass", "Present."));
  else if (sshResult.ok) {
    blockers.push("package.json is missing in the Pi app path.");
    checks.push(makeCheck("package_json", "package.json", "fail", "Missing."));
  }

  if (remote.script_platform_api_serve === "present") checks.push(makeCheck("api_script", "platform:api:serve script", "pass", "Present."));
  else if (sshResult.ok) {
    blockers.push("npm script platform:api:serve is missing on the Pi checkout.");
    checks.push(makeCheck("api_script", "platform:api:serve script", "fail", remote.script_platform_api_serve || "Missing."));
  }

  if (remote.systemd_version) checks.push(makeCheck("systemd", "systemd available", "pass", remote.systemd_version));
  else if (sshResult.ok) {
    blockers.push("systemd is unavailable or could not be checked.");
    checks.push(makeCheck("systemd", "systemd available", "fail", "Missing."));
  }

  if (remote.npm_path) checks.push(makeCheck("npm_path", "Pi npm path", "pass", remote.npm_path));
  else if (sshResult.ok) {
    blockers.push("npm path could not be resolved on the Pi.");
    checks.push(makeCheck("npm_path", "Pi npm path", "fail", "Missing."));
  }

  if (remote.node_path) checks.push(makeCheck("node_path", "Pi node path", "pass", remote.node_path));
  if (remote.npm_version) checks.push(makeCheck("npm_version", "Pi npm version", "pass", remote.npm_version));
  if (remote.node_version) checks.push(makeCheck("node_version", "Pi node version", "pass", remote.node_version));

  if (smokeReport?.status === "pass" && smokeReport?.execution?.portAfterCleanup === "closed") {
    checks.push(makeCheck("api_smoke", "Foreground API smoke report", "pass", `Passed at ${smokeReport.checkedAt || "unknown time"}.`));
  } else {
    blockers.push("A passing foreground API smoke report is required before service installation planning can be approved.");
    checks.push(makeCheck("api_smoke", "Foreground API smoke report", "fail", smokeReport ? `Status ${smokeReport.status || "unknown"}.` : "Missing."));
  }

  if (remote.api_port === "open") {
    warnings.push(`API port ${apiPort} is currently open. Confirm no unmanaged API process is running before installing the service.`);
    checks.push(makeCheck("api_port", `API port ${apiPort}`, "warning", "Open."));
  } else if (remote.api_port === "closed") {
    checks.push(makeCheck("api_port", `API port ${apiPort}`, "pass", "Closed before service install."));
  }

  if (remote.service_unit_file) {
    warnings.push(`${serviceName} appears in systemd unit files: ${remote.service_unit_file}. This plan should be reviewed against the installed state.`);
    checks.push(makeCheck("service_unit", serviceName, "warning", remote.service_unit_file));
  } else {
    checks.push(makeCheck("service_unit", serviceName, "pass", "Not installed."));
  }

  if (remote.installed_service_file === "present") {
    warnings.push(`${expectedServicePath} already exists. Do not overwrite without reviewing the installed unit.`);
    checks.push(makeCheck("installed_service_file", "Installed service file", "warning", "Present."));
  } else if (remote.installed_service_file === "missing") {
    checks.push(makeCheck("installed_service_file", "Installed service file", "pass", "Missing, as expected."));
  }

  checks.push(...template.checks);
  warnings.push(...template.warnings);
  blockers.push(...template.blockers);

  const status = blockers.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY_FOR_SERVICE_INSTALL";
  return { status, checks, warnings, blockers };
}

function plannedCommands({ appPath }) {
  return [
    `cd ${appPath}`,
    `sudo cp deploy/systemd/sentinel-api.service.example ${expectedServicePath}`,
    "sudo systemctl daemon-reload",
    "sudo systemctl enable sentinel-api",
    "sudo systemctl start sentinel-api",
    "sudo systemctl status sentinel-api",
    `curl http://${apiHost}:${apiPort}/health`,
  ];
}

function buildReport() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const sshResult = runSsh({ host, user, sshPort, appPath });
  const remote = sshResult.ok ? parseRemoteOutput(sshResult.stdout) : {};
  const smokeReport = readJsonIfExists(smokeReportPath);
  const template = loadTemplateSummary(remote.npm_path || "");
  const classification = classify({ host, user, sshResult, remote, smokeReport, template });

  return {
    checkedAt: new Date().toISOString(),
    status: classification.status,
    target: {
      host,
      sshUser: user,
      sshPort,
      appPath,
      expectedServicePath,
      apiHost,
      apiPort,
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
      appPath: remote.app_path || appPath,
      npmPath: remote.npm_path || "unknown",
      nodePath: remote.node_path || "unknown",
      npmVersion: remote.npm_version || "unknown",
      nodeVersion: remote.node_version || "unknown",
      systemdVersion: remote.systemd_version || "unknown",
      apiPort: remote.api_port || "unknown",
      serviceUnitFile: remote.service_unit_file || "not_installed",
      serviceActive: remote.service_active || "unknown",
      installedServiceFile: remote.installed_service_file || "unknown",
    },
    smokeReport: smokeReport
      ? {
          path: path.relative(repoRoot, smokeReportPath),
          status: smokeReport.status || "unknown",
          checkedAt: smokeReport.checkedAt || "unknown",
          portAfterCleanup: smokeReport.execution?.portAfterCleanup || "unknown",
        }
      : { path: path.relative(repoRoot, smokeReportPath), status: "missing" },
    template: {
      path: path.relative(repoRoot, templatePath),
      exists: template.exists,
      expectedNpmPath: template.expectedNpmPath,
      workingDirectory: template.values.workingDirectory || "unknown",
      environmentFile: template.values.environmentFile || "unknown",
      execStart: template.values.execStart || "unknown",
      user: template.values.user || "unknown",
      group: template.values.group || "unknown",
    },
    plannedCommands: plannedCommands({ appPath }),
    checks: classification.checks,
    warnings: classification.warnings,
    blockers: classification.blockers,
    recommendedNextStep: classification.blockers.length
      ? "Resolve service planning blockers, then rerun npm run platform:pi:service:plan."
      : "Review the planned commands. Install the service only in a separate explicitly approved task.",
  };
}

function statusIcon(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi API Service Install Plan",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- SSH user: ${report.target.sshUser}`,
    `- App path: ${report.target.appPath}`,
    `- Service path: ${report.target.expectedServicePath}`,
    `- API bind: ${report.target.apiHost}:${report.target.apiPort}`,
    "",
    "## Pi Runtime",
    "",
    `- Hostname: ${report.remote.hostname}`,
    `- Node: ${report.remote.nodeVersion} at ${report.remote.nodePath}`,
    `- npm: ${report.remote.npmVersion} at ${report.remote.npmPath}`,
    `- systemd: ${report.remote.systemdVersion}`,
    `- API port ${apiPort}: ${report.remote.apiPort}`,
    `- Service unit: ${report.remote.serviceUnitFile}`,
    `- Service active: ${report.remote.serviceActive}`,
    "",
    "## Template",
    "",
    `- Template: ${report.template.path}`,
    `- Expected npm path: ${report.template.expectedNpmPath}`,
    `- WorkingDirectory: ${report.template.workingDirectory}`,
    `- EnvironmentFile: ${report.template.environmentFile}`,
    `- ExecStart: ${report.template.execStart}`,
    "",
    "## Planned Commands",
    "",
    ...report.plannedCommands.map((command) => `- ${command}`),
    "",
    "These commands are not executed by this plan.",
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
  console.log("Sentinel Raspberry Pi API Service Install Plan");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`App path: ${report.target.appPath}`);
  console.log(`Service path: ${report.target.expectedServicePath}`);
  console.log(`Status: ${report.status}`);
  console.log("");
  console.log("Runtime:");
  console.log(`- npm: ${report.remote.npmVersion} at ${report.remote.npmPath}`);
  console.log(`- node: ${report.remote.nodeVersion} at ${report.remote.nodePath}`);
  console.log(`- systemd: ${report.remote.systemdVersion}`);
  console.log(`- API port ${apiPort}: ${report.remote.apiPort}`);
  console.log(`- Service unit: ${report.remote.serviceUnitFile}`);
  console.log("");
  console.log("Template:");
  console.log(`- ${report.template.path}`);
  console.log(`- ExecStart: ${report.template.execStart}`);
  console.log(`- Expected npm path: ${report.template.expectedNpmPath}`);
  console.log("");
  console.log("Planned commands, not executed:");
  report.plannedCommands.forEach((command) => console.log(`- ${command}`));
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
