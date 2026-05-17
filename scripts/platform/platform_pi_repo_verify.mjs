import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-repo-verify.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-repo-verify.md");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const apiPort = 4317;
const requiredScripts = ["build", "platform:init", "platform:health", "platform:api:serve"];

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
  return `printf '__sentinel_${name}__='; ${command} 2>&1 || true; printf '\\n'`;
}

function remoteScript({ appPath }) {
  const quotedAppPath = shellQuote(appPath);
  const scriptChecks = requiredScripts
    .map((scriptName) => marker(
      `script_${scriptName.replace(/[^A-Za-z0-9]/g, "_")}`,
      `cd "$APP_PATH" 2>/dev/null && node -e 'const p=require("./package.json"); process.stdout.write(p.scripts && p.scripts[process.argv[1]] ? "present" : "missing")' ${shellQuote(scriptName)}`,
    ))
    .join("\n");

  return String.raw`
set +e
APP_PATH=${quotedAppPath}
printf '__sentinel_shell_ok__=shell_ok
'
printf '__sentinel_hostname__='; hostname 2>&1 || true
printf '__sentinel_user__='; id -un 2>&1 || true
printf '__sentinel_node__='; node -v 2>&1 || true
printf '__sentinel_npm__='; npm -v 2>&1 || true
printf '__sentinel_git__='; git --version 2>&1 || true
printf '__sentinel_app_path__=%s
' "$APP_PATH"
printf '__sentinel_app_exists__='; if [ -e "$APP_PATH" ]; then echo present; else echo missing; fi
printf '__sentinel_app_directory__='; if [ -d "$APP_PATH" ]; then echo present; else echo missing; fi
printf '__sentinel_git_repo__='; if [ -d "$APP_PATH/.git" ]; then echo present; else echo missing; fi
${marker("branch", "cd \"$APP_PATH\" 2>/dev/null && git branch --show-current")}
${marker("commit", "cd \"$APP_PATH\" 2>/dev/null && git rev-parse --short HEAD")}
${marker("remote", "cd \"$APP_PATH\" 2>/dev/null && git remote get-url origin")}
${marker("git_status_count", "cd \"$APP_PATH\" 2>/dev/null && git status --short | wc -l | tr -d ' '")}
${marker("git_status_excerpt", "cd \"$APP_PATH\" 2>/dev/null && git status --short | head -n 10 | paste -sd '|' -")}
printf '__sentinel_package_json__='; if [ -f "$APP_PATH/package.json" ]; then echo present; else echo missing; fi
printf '__sentinel_package_lock__='; if [ -f "$APP_PATH/package-lock.json" ]; then echo present; else echo missing; fi
printf '__sentinel_node_modules__='; if [ -d "$APP_PATH/node_modules" ]; then echo present; else echo missing; fi
printf '__sentinel_dist__='; if [ -d "$APP_PATH/dist" ]; then echo present; else echo missing; fi
printf '__sentinel_platform_db__='; if [ -f "$APP_PATH/platform/persistence/platform.db" ]; then echo present; else echo missing; fi
${marker("platform_db_size", "du -h \"$APP_PATH/platform/persistence/platform.db\" 2>/dev/null | cut -f1")}
${scriptChecks}
printf '__sentinel_api_port__='; (timeout 1 bash -c "</dev/tcp/127.0.0.1/${apiPort}" >/dev/null 2>&1 && echo open) || echo closed
printf '__sentinel_service_file__='; systemctl list-unit-files sentinel-api.service --no-legend 2>/dev/null | awk '{print $1 ":" $2}' || true; printf '\n'
printf '__sentinel_service_active__='; systemctl is-active sentinel-api.service 2>&1 || true
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
    remoteScript({ appPath }),
  ], {
    cwd: repoRoot,
    encoding: "utf8",
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
    if (match) values[match[1]] = match[2].trim();
  }
  return values;
}

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function classify({ host, user, sshResult, remote }) {
  const checks = [];
  const blockers = [];
  const warnings = [];

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
    blockers.push("SSH read-only verification failed. Confirm key-based BatchMode access.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", sshResult.stderr || sshResult.stdout || "SSH failed."));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (remote.shell_ok === "shell_ok") {
    checks.push(makeCheck("shell", "Remote shell", "pass", "Read-only shell checks executed."));
  } else if (sshResult.ok) {
    blockers.push("Remote shell did not return the expected verification marker.");
    checks.push(makeCheck("shell", "Remote shell", "fail", "Missing shell marker."));
  }

  const requiredPresence = [
    ["app_exists", "App path exists", "app path missing"],
    ["app_directory", "App path is directory", "app path is not a directory"],
    ["git_repo", "App path is Git repo", "app path is not a Git repo"],
    ["package_json", "package.json", "package.json missing"],
    ["package_lock", "package-lock.json", "package-lock.json missing"],
    ["node_modules", "node_modules", "node_modules missing"],
    ["dist", "dist", "dist missing"],
    ["platform_db", "platform DB", "platform/persistence/platform.db missing"],
  ];

  for (const [key, label, blockerText] of requiredPresence) {
    if (remote[key] === "present") {
      checks.push(makeCheck(key, label, "pass", "Present."));
    } else {
      blockers.push(blockerText);
      checks.push(makeCheck(key, label, "fail", remote[key] || "Missing."));
    }
  }

  if (remote.branch) checks.push(makeCheck("branch", "Git branch", "pass", remote.branch));
  else {
    blockers.push("Git branch could not be read.");
    checks.push(makeCheck("branch", "Git branch", "fail", "Missing."));
  }

  if (remote.commit) checks.push(makeCheck("commit", "Git commit", "pass", remote.commit));
  else {
    blockers.push("Git commit could not be read.");
    checks.push(makeCheck("commit", "Git commit", "fail", "Missing."));
  }

  const statusCount = Number(remote.git_status_count || 0);
  if (statusCount === 0) {
    checks.push(makeCheck("git_status", "Git status clean", "pass", "Clean."));
  } else {
    blockers.push("Pi checkout has uncommitted tracked changes.");
    checks.push(makeCheck("git_status", "Git status clean", "fail", remote.git_status_excerpt || `${statusCount} changed item(s).`));
  }

  for (const scriptName of requiredScripts) {
    const key = `script_${scriptName.replace(/[^A-Za-z0-9]/g, "_")}`;
    if (remote[key] === "present") {
      checks.push(makeCheck(key, `npm script ${scriptName}`, "pass", "Present."));
    } else {
      blockers.push(`npm script ${scriptName} missing from package.json.`);
      checks.push(makeCheck(key, `npm script ${scriptName}`, "fail", remote[key] || "Missing."));
    }
  }

  if (remote.platform_db === "present") {
    warnings.push("Platform DB is currently repo-local at platform/persistence/platform.db. Review this before making the Pi the canonical runtime state.");
    checks.push(makeCheck("platform_db_location", "Platform DB location", "warning", `Repo-local DB present${remote.platform_db_size ? ` (${remote.platform_db_size})` : ""}.`));
  }

  if (remote.api_port === "open") {
    checks.push(makeCheck("api_port", `API port ${apiPort}`, "pass", "Open. Run platform:pi:service:verify for service health."));
  } else {
    warnings.push(`Sentinel API port ${apiPort} is not running. This is expected before foreground smoke testing.`);
    checks.push(makeCheck("api_port", `API port ${apiPort}`, "warning", "Closed."));
  }

  if (remote.service_file) {
    checks.push(makeCheck("service", "sentinel-api.service", "pass", `${remote.service_file}. Run platform:pi:service:verify for service state.`));
  } else {
    warnings.push("sentinel-api.service is not installed yet. This is expected before the service installation task.");
    checks.push(makeCheck("service", "sentinel-api.service", "warning", "Not installed."));
  }

  const status = blockers.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY_FOR_API_SMOKE";

  return { status, checks, warnings, blockers };
}

function buildReport() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const sshResult = runSsh({ host, user, sshPort, appPath });
  const remote = sshResult.ok ? parseRemoteOutput(sshResult.stdout) : {};
  const classification = classify({ host, user, sshResult, remote });

  return {
    checkedAt: new Date().toISOString(),
    status: classification.status,
    target: { host, sshUser: user, sshPort, appPath },
    ssh: {
      attempted: sshResult.attempted,
      ok: sshResult.ok,
      exitCode: sshResult.exitCode,
      stderr: sshResult.stderr.trim(),
    },
    remote: {
      hostname: remote.hostname || "unknown",
      user: remote.user || "unknown",
      node: remote.node || "unknown",
      npm: remote.npm || "unknown",
      git: remote.git || "unknown",
      branch: remote.branch || "unknown",
      commit: remote.commit || "unknown",
      remoteUrl: remote.remote || "unknown",
      gitStatusCount: Number(remote.git_status_count || 0),
      appPath: remote.app_path || appPath,
      apiPort: remote.api_port || "unknown",
      serviceFile: remote.service_file || "not_installed",
      serviceActive: remote.service_active || "unknown",
      platformDbSize: remote.platform_db_size || "unknown",
    },
    checks: classification.checks,
    warnings: classification.warnings,
    blockers: classification.blockers,
    recommendedNextStep: classification.blockers.length
      ? "Resolve repo deployment blockers, then rerun npm run platform:pi:repo:verify."
      : remote.service_file
        ? "Repo deployment is verified. Run npm run platform:pi:service:verify for installed service health."
        : "Repo deployment is verified for the next phase. Plan a foreground API smoke test before installing systemd service files.",
  };
}

function statusIcon(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Repo Verification",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- SSH user: ${report.target.sshUser}`,
    `- App path: ${report.target.appPath}`,
    "",
    "## Remote State",
    "",
    `- Hostname: ${report.remote.hostname}`,
    `- Node: ${report.remote.node}`,
    `- npm: ${report.remote.npm}`,
    `- Git: ${report.remote.git}`,
    `- Branch: ${report.remote.branch}`,
    `- Commit: ${report.remote.commit}`,
    `- Git status count: ${report.remote.gitStatusCount}`,
    `- API port ${apiPort}: ${report.remote.apiPort}`,
    `- Service: ${report.remote.serviceFile}`,
    `- Platform DB size: ${report.remote.platformDbSize}`,
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
  console.log("Sentinel Raspberry Pi Repo Verification");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`App path: ${report.target.appPath}`);
  console.log(`Status: ${report.status}`);
  console.log(`Commit: ${report.remote.commit}`);
  console.log(`Branch: ${report.remote.branch}`);
  console.log(`API port ${apiPort}: ${report.remote.apiPort}`);
  console.log(`Service: ${report.remote.serviceFile}`);
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
