import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-post-prep-verify.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-post-prep-verify.md");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultPort = "22";
const defaultUser = "matthew";
const defaultDeployRoot = "/srv/sentinel";
const legacyDeployRoot = "/srv/matthew-platform";
const apiPort = 4317;

function parseLocalEnv() {
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

const localEnv = parseLocalEnv();

function configValue(name, fallback = "") {
  const envValue = process.env[name] && String(process.env[name]).trim() ? String(process.env[name]).trim() : "";
  if (envValue) return envValue;
  const fileValue = localEnv[name] && String(localEnv[name]).trim() ? String(localEnv[name]).trim() : "";
  return fileValue || fallback;
}

function normaliseDeployRoot(value) {
  return value === legacyDeployRoot ? defaultDeployRoot : value;
}

function sshTarget({ user, host }) {
  return `${user}@${host}`;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function checkPort(host, port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: timeoutMs });
    let settled = false;

    const finish = (open) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(open);
    };

    socket.on("connect", () => finish(true));
    socket.on("timeout", () => finish(false));
    socket.on("error", () => finish(false));
  });
}

function requiredDirectories(deployRoot) {
  return [
    deployRoot,
    `${deployRoot}/apps`,
    `${deployRoot}/apps/seo-ops`,
    `${deployRoot}/data`,
    `${deployRoot}/data/seo-ops`,
    `${deployRoot}/data/seo-ops/backups`,
    `${deployRoot}/data/seo-ops/reports`,
    `${deployRoot}/logs`,
    `${deployRoot}/logs/seo-ops`,
  ];
}

function remoteScript({ deployRoot }) {
  const directories = requiredDirectories(deployRoot);
  const quotedDirectories = directories.map(shellQuote).join(" ");

  return String.raw`
set +e
printf '__sentinel_shell_ok__=shell_ok\n'
printf '__sentinel_hostname__='; hostname 2>&1 || true
printf '__sentinel_user__='; id -un 2>&1 || true
printf '__sentinel_node_path__='; command -v node 2>/dev/null || true; printf '\n'
printf '__sentinel_node_version__='; node -v 2>&1 || true
printf '__sentinel_npm_path__='; command -v npm 2>/dev/null || true; printf '\n'
printf '__sentinel_npm_version__='; npm -v 2>&1 || true
printf '__sentinel_repo_state__='; if [ -d ${shellQuote(`${deployRoot}/apps/seo-ops/.git`)} ]; then echo repo_present; else echo repo_absent; fi
printf '__sentinel_service_file__='; systemctl list-unit-files sentinel-api.service --no-legend 2>/dev/null | awk '{print $1 ":" $2}' || true; printf '\n'
printf '__sentinel_service_active__='; systemctl is-active sentinel-api.service 2>&1 || true
for dir in ${quotedDirectories}; do
  if [ -d "$dir" ]; then
    owner="$(stat -c '%U:%G' "$dir" 2>&1)"
    mode="$(stat -c '%a' "$dir" 2>&1)"
    access=""
    [ -r "$dir" ] && access="$access"r || access="$access"-
    [ -w "$dir" ] && access="$access"w || access="$access"-
    [ -x "$dir" ] && access="$access"x || access="$access"-
    printf '__sentinel_dir__=%s|present|%s|%s|%s\n' "$dir" "$owner" "$mode" "$access"
  else
    printf '__sentinel_dir__=%s|missing|||\n' "$dir"
  fi
done
`;
}

function runSshVerify({ host, user, sshPort, deployRoot }) {
  const result = spawnSync("ssh", [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(sshPort),
    sshTarget({ user, host }),
    remoteScript({ deployRoot }),
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
  const directories = [];

  for (const line of stdout.split(/\r?\n/)) {
    const keyValue = line.match(/^__sentinel_([^=]+)__=(.*)$/);
    if (!keyValue) continue;
    const [, key, value] = keyValue;

    if (key === "dir") {
      const [dirPath, state, owner, mode, access] = value.split("|");
      directories.push({ path: dirPath, state, owner, mode, access });
    } else {
      values[key] = value.trim();
    }
  }

  return { ...values, directories };
}

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function classify({ host, user, sshResult, parsed, deployRoot, portOpen }) {
  const checks = [];
  const blockers = [];
  const warnings = [];

  if (!host) {
    blockers.push("RASPBERRY_PI_HOST is missing from the local environment or local .env.");
    checks.push(makeCheck("host", "Host configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("host", "Host configured", "pass", host));
  }

  if (!user) {
    blockers.push("RASPBERRY_PI_USER is missing from the local environment or local .env.");
    checks.push(makeCheck("user", "User configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("user", "User configured", "pass", "Configured."));
  }

  if (!sshResult.attempted) {
    blockers.push("SSH verification was not attempted because host or user is missing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "Not attempted."));
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only verification failed. Confirm key-based BatchMode access before continuing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", sshResult.stderr || sshResult.stdout || "SSH failed."));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (parsed.shell_ok === "shell_ok") {
    checks.push(makeCheck("shell", "Remote shell", "pass", "Read-only shell checks executed."));
  } else if (sshResult.ok) {
    blockers.push("Remote shell did not return the expected verification marker.");
    checks.push(makeCheck("shell", "Remote shell", "fail", "Missing shell marker."));
  }

  if (parsed.hostname) checks.push(makeCheck("hostname", "Hostname", "pass", parsed.hostname));

  if (!parsed.node_path || !/^v\d+/.test(parsed.node_version || "")) {
    warnings.push("Node.js is missing after preparation. Manual interactive setup has not completed or did not install Node.");
    checks.push(makeCheck("node", "Node.js", "warning", parsed.node_version || "Node.js not found."));
  } else {
    checks.push(makeCheck("node", "Node.js", "pass", parsed.node_version));
  }

  if (!parsed.npm_path || !/^\d+/.test(parsed.npm_version || "")) {
    warnings.push("npm is missing after preparation. Manual interactive setup has not completed or did not install npm.");
    checks.push(makeCheck("npm", "npm", "warning", parsed.npm_version || "npm not found."));
  } else {
    checks.push(makeCheck("npm", "npm", "pass", parsed.npm_version));
  }

  const expectedOwner = user ? `${user}:${user}` : "";
  const missingDirs = [];
  const ownershipIssues = [];
  const accessIssues = [];
  const directoryMap = new Map((parsed.directories || []).map((entry) => [entry.path, entry]));

  for (const dirPath of requiredDirectories(deployRoot)) {
    const entry = directoryMap.get(dirPath);
    if (!entry || entry.state !== "present") {
      missingDirs.push(dirPath);
      checks.push(makeCheck(`dir_${dirPath}`, dirPath, "warning", "Missing."));
      continue;
    }

    const ownerStatus = expectedOwner && entry.owner === expectedOwner ? "pass" : "warning";
    if (ownerStatus !== "pass") ownershipIssues.push(`${dirPath} owner is ${entry.owner || "unknown"}, expected ${expectedOwner || "configured user"}.`);

    const accessStatus = entry.access === "rwx" ? "pass" : "warning";
    if (accessStatus !== "pass") accessIssues.push(`${dirPath} access is ${entry.access || "unknown"}, expected rwx for the SSH user.`);

    checks.push(makeCheck(`dir_${dirPath}`, dirPath, ownerStatus === "pass" && accessStatus === "pass" ? "pass" : "warning", `owner=${entry.owner || "unknown"}; mode=${entry.mode || "unknown"}; access=${entry.access || "unknown"}`));
  }

  if (missingDirs.length) warnings.push(`${missingDirs.length} required Sentinel directory/directories are missing under ${deployRoot}.`);
  if (ownershipIssues.length) warnings.push(`${ownershipIssues.length} directory ownership issue(s) found.`);
  if (accessIssues.length) warnings.push(`${accessIssues.length} directory read/write/execute access issue(s) found for the SSH user.`);

  if (parsed.repo_state === "repo_present") {
    warnings.push("A Git checkout already exists under apps/seo-ops. Confirm this was intentional, because repo deployment is out of scope for prep verification.");
    checks.push(makeCheck("repo", "Repo not cloned yet", "warning", "Repo checkout found."));
  } else {
    warnings.push("Repo is not cloned yet. This is expected before the separate repo deployment task.");
    checks.push(makeCheck("repo", "Repo not cloned yet", "warning", "No Git checkout detected under apps/seo-ops."));
  }

  if (portOpen) {
    warnings.push(`Sentinel API port ${apiPort} is open. Confirm this is expected, because API startup is out of scope for prep verification.`);
    checks.push(makeCheck("api_port", `Port ${apiPort}`, "warning", "Open from local network."));
  } else {
    warnings.push(`Sentinel API port ${apiPort} is not running. This is expected before service installation.`);
    checks.push(makeCheck("api_port", `Port ${apiPort}`, "warning", "Closed from local network."));
  }

  if (parsed.service_file) {
    warnings.push(`sentinel-api.service is already present: ${parsed.service_file}. Confirm this was intentional, because service installation is out of scope for prep verification.`);
    checks.push(makeCheck("service", "sentinel-api.service", "warning", parsed.service_file));
  } else {
    warnings.push("sentinel-api.service is not installed yet. This is expected before the separate service installation task.");
    checks.push(makeCheck("service", "sentinel-api.service", "warning", "Not installed."));
  }

  const readyChecks = checks.filter((check) => ["node", "npm"].includes(check.id) || String(check.id).startsWith("dir_"));
  const requiredReady = readyChecks.every((check) => check.status === "pass");
  const overallStatus = blockers.length ? "NOT_READY" : requiredReady ? warnings.length ? "READY_WITH_WARNINGS" : "READY_FOR_REPO_DEPLOY" : "NOT_READY";

  return { overallStatus, checks, blockers, warnings };
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownReportPath, buildMarkdown(report), "utf8");
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Post-Prep Verification",
    "",
    `Checked: ${report.checkedAt}`,
    "",
    "This verification is read-only. It uses non-interactive SSH checks and a local port probe only. It does not install packages, create directories, clone repositories, write test files, start services, use sudo or expose the API.",
    "",
    "## Decision",
    "",
    `- Status: ${report.overallStatus}`,
    `- Host: ${report.target.host || "missing"}`,
    `- User configured: ${report.target.userConfigured ? "yes" : "no"}`,
    `- Deploy root: ${report.target.deployRoot}`,
    `- SSH attempted: ${report.ssh.attempted ? "yes" : "no"}`,
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((blocker) => `- ${blocker}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Checks",
    "",
    "| Check | Status | Detail |",
    "| --- | --- | --- |",
    ...report.checks.map((check) => `| ${check.label} | ${check.status} | ${String(check.detail || "").replace(/\r?\n/g, "<br>")} |`),
    "",
    "## Recommended Next Step",
    "",
    report.recommendedNextStep,
  ];

  return `${lines.join("\n")}\n`;
}

function printReport(report) {
  console.log("Sentinel Raspberry Pi Post-Prep Verification");
  console.log("");
  console.log(`Host: ${report.target.host || "missing"}`);
  console.log(`User configured: ${report.target.userConfigured ? "yes" : "no"}`);
  console.log(`SSH attempted: ${report.ssh.attempted ? "yes" : "no"}`);
  console.log(`Status: ${report.overallStatus}`);
  console.log("");

  if (report.blockers.length) {
    console.log("Blockers:");
    report.blockers.forEach((blocker) => console.log(`- ${blocker}`));
    console.log("");
  }

  if (report.warnings.length) {
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
    console.log("");
  }

  console.log("Checks:");
  report.checks.forEach((check) => console.log(`- ${check.label}: ${check.status}`));
  console.log("");
  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

async function main() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const configuredDeployRoot = configValue("RASPBERRY_PI_DEPLOY_ROOT", defaultDeployRoot);
  const deployRoot = normaliseDeployRoot(configuredDeployRoot);
  const sshResult = host && user
    ? runSshVerify({ host, user, sshPort, deployRoot })
    : { attempted: false, ok: false, exitCode: 1, stdout: "", stderr: "Missing host or user." };
  const parsed = sshResult.ok ? parseRemoteOutput(sshResult.stdout) : {};
  const portOpen = host ? await checkPort(host, apiPort) : false;
  const classified = classify({ host, user, sshResult, parsed, deployRoot, portOpen });
  if (configuredDeployRoot === legacyDeployRoot) {
    classified.warnings.push(`Local configuration still points at legacy ${legacyDeployRoot}; verification used canonical ${defaultDeployRoot}.`);
    if (classified.overallStatus === "READY_FOR_REPO_DEPLOY") classified.overallStatus = "READY_WITH_WARNINGS";
  }
  const report = {
    checkedAt: new Date().toISOString(),
    readOnly: true,
    mutationPerformed: false,
    target: {
      host,
      userConfigured: Boolean(user),
      sshPort,
      deployRoot,
      legacyDeployRootConfigured: configuredDeployRoot === legacyDeployRoot,
      envFileUsed: fs.existsSync(envPath),
    },
    ssh: {
      attempted: sshResult.attempted,
      ok: sshResult.ok,
      exitCode: sshResult.exitCode,
      stderr: sshResult.stderr.trim(),
    },
    remote: parsed,
    port4317Open: portOpen,
    ...classified,
    recommendedNextStep: classified.overallStatus === "READY_FOR_REPO_DEPLOY" || classified.overallStatus === "READY_WITH_WARNINGS"
      ? "Runtime preparation is verified. Plan the separate repo deployment step next; do not start services until a smoke test task is approved."
      : "Complete the interactive setup guide, then rerun npm run platform:pi:post-prep:verify before planning repo deployment.",
    safety: {
      installsPackages: false,
      createsDirectories: false,
      writesTestFiles: false,
      clonesRepo: false,
      startsServices: false,
      exposesApi: false,
      usesSudo: false,
    },
  };

  writeReports(report);
  printReport(report);

  if (report.blockers.length) {
    process.exitCode = 1;
  }
}

main();
