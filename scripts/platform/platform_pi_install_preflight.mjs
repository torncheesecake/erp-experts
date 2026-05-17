import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-install-preflight.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-install-preflight.md");
const sshPort = process.env.RASPBERRY_PI_SSH_PORT || "22";
const deployRoot = process.env.RASPBERRY_PI_DEPLOY_ROOT || "/srv/sentinel";
const apiPort = 4317;
const minimumDiskFreeGb = 5;
const supportedArchitectures = new Set(["aarch64", "arm64"]);

function envValue(name) {
  return process.env[name] && String(process.env[name]).trim() ? String(process.env[name]).trim() : "";
}

function sshTarget({ user, host }) {
  return `${user}@${host}`;
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

function readOnlyRemoteScript() {
  return String.raw`
set +e
printf '__sentinel_shell_ok__=shell_ok\n'
printf '__sentinel_hostname__='; hostname 2>&1 || true
printf '__sentinel_uname__='; uname -a 2>&1 || true
printf '__sentinel_arch__='; uname -m 2>&1 || true
printf '__sentinel_user__='; id -un 2>&1 || true
printf '__sentinel_whoami__='; whoami 2>&1 || true
printf '__sentinel_git_path__='; command -v git 2>/dev/null || true
printf '__sentinel_git_version__='; git --version 2>&1 || true
printf '__sentinel_systemd_path__='; command -v systemctl 2>/dev/null || true
printf '__sentinel_systemd_version__='; systemctl --version 2>&1 | head -1 || true
printf '__sentinel_node_path__='; command -v node 2>/dev/null || true
printf '__sentinel_node_version__='; node -v 2>&1 || true
printf '__sentinel_npm_path__='; command -v npm 2>/dev/null || true
printf '__sentinel_npm_version__='; npm -v 2>&1 || true
printf '__sentinel_disk__\n'; df -Pk / 2>&1 || true
printf '__sentinel_memory__\n'; free -m 2>&1 || true
printf '__sentinel_srv__='; ls -ld /srv 2>&1 || true
printf '__sentinel_deploy_root__='; ls -ld ${deployRoot} 2>&1 || true
`;
}

function runSshPreflight({ host, user }) {
  const result = spawnSync("ssh", [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(sshPort),
    sshTarget({ user, host }),
    readOnlyRemoteScript(),
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

function parseMarkedOutput(stdout) {
  const lines = stdout.split(/\r?\n/);
  const values = {};
  const blocks = {};
  let currentBlock = null;

  for (const line of lines) {
    if (line === "__sentinel_disk__" || line === "__sentinel_memory__") {
      currentBlock = line.replace("__sentinel_", "").replace("__", "");
      blocks[currentBlock] = [];
      continue;
    }

    const keyValue = line.match(/^__sentinel_([^=]+)__=(.*)$/);
    if (keyValue) {
      currentBlock = null;
      values[keyValue[1]] = keyValue[2].trim();
      continue;
    }

    if (currentBlock && line.trim()) {
      blocks[currentBlock].push(line);
    }
  }

  return {
    ...values,
    disk: blocks.disk?.join("\n") || "",
    memory: blocks.memory?.join("\n") || "",
  };
}

function parseDiskFreeGb(diskOutput) {
  const rows = diskOutput.trim().split(/\r?\n/).filter(Boolean);
  const data = rows.find((row) => row.startsWith("/"));
  if (!data) return null;
  const columns = data.split(/\s+/);
  const availableKb = Number(columns[3]);
  if (!Number.isFinite(availableKb)) return null;
  return availableKb / 1024 / 1024;
}

function parseMemoryTotalMb(memoryOutput) {
  const memLine = memoryOutput.split(/\r?\n/).find((line) => /^Mem:/.test(line));
  if (!memLine) return null;
  const columns = memLine.split(/\s+/);
  const totalMb = Number(columns[1]);
  return Number.isFinite(totalMb) ? totalMb : null;
}

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function classify({ host, user, sshResult, parsed, portOpen }) {
  const checks = [];
  const blockers = [];
  const warnings = [];

  if (!host) {
    blockers.push("RASPBERRY_PI_HOST is missing from the local environment.");
    checks.push(makeCheck("env_host", "Host configured", "fail", "RASPBERRY_PI_HOST is missing."));
  } else {
    checks.push(makeCheck("env_host", "Host configured", "pass", host));
  }

  if (!user) {
    blockers.push("RASPBERRY_PI_USER is missing from the local environment.");
    checks.push(makeCheck("env_user", "User configured", "fail", "RASPBERRY_PI_USER is missing."));
  } else {
    checks.push(makeCheck("env_user", "User configured", "pass", user));
  }

  if (!sshResult?.attempted) {
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "SSH was not attempted because host or user is missing."));
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only preflight failed. Confirm key-based BatchMode access before install preparation.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", sshResult.stderr || sshResult.stdout || "SSH failed."));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (parsed.hostname) {
    checks.push(makeCheck("hostname", "Hostname", "pass", parsed.hostname));
  }

  if (parsed.uname) {
    checks.push(makeCheck("os_kernel", "OS/kernel", "pass", parsed.uname));
  }

  if (!parsed.arch) {
    blockers.push("Architecture could not be detected.");
    checks.push(makeCheck("architecture", "Architecture", "fail", "Missing uname -m output."));
  } else if (!supportedArchitectures.has(parsed.arch)) {
    blockers.push(`Unsupported architecture ${parsed.arch}. Expected aarch64/arm64 for this Pi deployment plan.`);
    checks.push(makeCheck("architecture", "Architecture", "fail", parsed.arch));
  } else {
    checks.push(makeCheck("architecture", "Architecture", "pass", parsed.arch));
  }

  const diskFreeGb = parseDiskFreeGb(parsed.disk || "");
  if (diskFreeGb === null) {
    blockers.push("Disk free space could not be parsed.");
    checks.push(makeCheck("disk", "Disk free", "fail", parsed.disk || "No disk output."));
  } else if (diskFreeGb < minimumDiskFreeGb) {
    blockers.push(`Disk free space is too low: ${diskFreeGb.toFixed(1)}GiB available, minimum ${minimumDiskFreeGb}GiB.`);
    checks.push(makeCheck("disk", "Disk free", "fail", `${diskFreeGb.toFixed(1)}GiB available.`));
  } else {
    checks.push(makeCheck("disk", "Disk free", "pass", `${diskFreeGb.toFixed(1)}GiB available.`));
  }

  const memoryTotalMb = parseMemoryTotalMb(parsed.memory || "");
  if (memoryTotalMb === null) {
    checks.push(makeCheck("memory", "Memory", "warning", parsed.memory || "No memory output."));
    warnings.push("Memory output could not be parsed.");
  } else {
    checks.push(makeCheck("memory", "Memory", "pass", `${Math.round(memoryTotalMb / 1024)}GiB total.`));
  }

  if (!parsed.git_path || !/^git version /.test(parsed.git_version || "")) {
    blockers.push("Git is missing or not usable on the Pi.");
    checks.push(makeCheck("git", "Git installed", "fail", parsed.git_version || "Git not found."));
  } else {
    checks.push(makeCheck("git", "Git installed", "pass", parsed.git_version));
  }

  if (!parsed.systemd_path || !/^systemd /.test(parsed.systemd_version || "")) {
    blockers.push("systemd is missing or not usable on the Pi.");
    checks.push(makeCheck("systemd", "systemd available", "fail", parsed.systemd_version || "systemd not found."));
  } else {
    checks.push(makeCheck("systemd", "systemd available", "pass", parsed.systemd_version));
  }

  if (!parsed.node_path || !/^v\d+/.test(parsed.node_version || "")) {
    warnings.push("Node.js is missing. This is expected before the first install preparation step.");
    checks.push(makeCheck("node", "Node.js", "warning", parsed.node_version || "Node.js not found."));
  } else {
    checks.push(makeCheck("node", "Node.js", "pass", parsed.node_version));
  }

  if (!parsed.npm_path || !/^\d+/.test(parsed.npm_version || "")) {
    warnings.push("npm is missing. This is expected before the first install preparation step.");
    checks.push(makeCheck("npm", "npm", "warning", parsed.npm_version || "npm not found."));
  } else {
    checks.push(makeCheck("npm", "npm", "pass", parsed.npm_version));
  }

  if (!parsed.srv || /No such file/.test(parsed.srv)) {
    blockers.push("/srv is missing on the Pi.");
    checks.push(makeCheck("srv", "/srv exists", "fail", parsed.srv || "Missing."));
  } else {
    checks.push(makeCheck("srv", "/srv exists", "pass", parsed.srv));
  }

  if (!parsed.deploy_root || /No such file/.test(parsed.deploy_root)) {
    warnings.push(`${deployRoot} is missing. This is expected before directory creation.`);
    checks.push(makeCheck("deploy_root", `${deployRoot} status`, "warning", parsed.deploy_root || "Missing."));
  } else {
    checks.push(makeCheck("deploy_root", `${deployRoot} status`, "pass", parsed.deploy_root));
  }

  if (portOpen) {
    warnings.push(`Port ${apiPort} is open. Confirm this is expected before install preparation.`);
    checks.push(makeCheck("api_port", `Port ${apiPort}`, "warning", "Open from local network."));
  } else {
    warnings.push(`Sentinel API port ${apiPort} is not open. This is expected before service installation.`);
    checks.push(makeCheck("api_port", `Port ${apiPort}`, "warning", "Closed from local network."));
  }

  if (parsed.user) {
    checks.push(makeCheck("current_user", "Current user", "pass", parsed.user));
  }

  if (parsed.shell_ok === "shell_ok") {
    checks.push(makeCheck("shell", "Basic shell commands", "pass", "Remote shell executed read-only commands."));
  } else if (sshResult?.ok) {
    blockers.push("Remote shell did not return the expected preflight marker.");
    checks.push(makeCheck("shell", "Basic shell commands", "fail", "Missing shell marker."));
  }

  const overallStatus = blockers.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY_FOR_INSTALL_PREP";
  return { overallStatus, checks, blockers, warnings };
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownReportPath, buildMarkdown(report), "utf8");
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Install Preflight",
    "",
    `Checked: ${report.checkedAt}`,
    "",
    "This preflight is read-only. It uses non-interactive SSH checks and a local port probe only. It does not install packages, create directories, copy files, start services, use sudo or expose the API.",
    "",
    "## Decision",
    "",
    `- Status: ${report.overallStatus}`,
    `- Host: ${report.target.host}`,
    `- User: ${report.target.user}`,
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
  console.log("Sentinel Raspberry Pi Install Preflight");
  console.log("");
  console.log(`Host: ${report.target.host || "missing"}`);
  console.log(`User configured: ${report.target.user ? "yes" : "no"}`);
  console.log(`SSH attempted: ${report.ssh.attempted ? "yes" : "no"}`);
  console.log(`Overall: ${report.overallStatus}`);
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
  const host = envValue("RASPBERRY_PI_HOST");
  const user = envValue("RASPBERRY_PI_USER");
  const sshResult = host && user
    ? runSshPreflight({ host, user })
    : { attempted: false, ok: false, exitCode: 1, stdout: "", stderr: "Missing host or user." };
  const parsed = sshResult.ok ? parseMarkedOutput(sshResult.stdout) : {};
  const portOpen = host ? await checkPort(host, apiPort) : false;
  const classified = classify({ host, user, sshResult, parsed, portOpen });
  const report = {
    checkedAt: new Date().toISOString(),
    readOnly: true,
    mutationPerformed: false,
    target: {
      host,
      user: user ? "configured" : "missing",
      sshPort,
      deployRoot,
      apiPort,
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
    recommendedNextStep: classified.blockers.length
      ? "Resolve blockers before first install preparation. Do not install or create directories yet."
      : "Review warnings, then use npm run platform:pi:install:dry-run before approving the first install preparation task.",
  };

  writeReports(report);
  printReport(report);

  if (report.overallStatus === "NOT_READY") {
    process.exitCode = 1;
  }
}

main();
