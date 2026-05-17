import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const DEFAULT_HOST = "192.168.4.22";
const DEFAULT_PORT = "22";
const DEFAULT_DEPLOY_ROOT = "/srv/matthew-platform";
const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-discovery.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-discovery.md");

const readOnlyChecks = [
  { id: "hostname", command: "hostname" },
  { id: "uname", command: "uname -a" },
  { id: "node", command: "node -v || true" },
  { id: "npm", command: "npm -v || true" },
  { id: "git", command: "git --version || true" },
  { id: "disk", command: "df -h /" },
  { id: "memory", command: "free -h || true" },
  { id: "directories", command: "ls -ld /srv /srv/matthew-platform || true" },
  { id: "systemd", command: "systemctl --version || true" },
];

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function safeEnv(name) {
  const value = process.env[name];
  return value && String(value).trim() ? String(value).trim() : "";
}

function ensureReportsDir() {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function runLocalCommand(command, args, options = {}) {
  try {
    const stdout = execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: options.timeoutMs || 15_000,
      env: process.env,
    });
    return { ok: true, stdout: stdout.trim(), stderr: "" };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error.stdout || "").trim(),
      stderr: String(error.stderr || error.message || "").trim(),
    };
  }
}

function sshTarget({ user, host }) {
  return user ? `${user}@${host}` : host;
}

function runSshCheck({ host, user, port, check }) {
  const args = [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(port),
    sshTarget({ user, host }),
    check.command,
  ];

  const result = runLocalCommand("ssh", args, { timeoutMs: 20_000 });
  return {
    id: check.id,
    command: check.command,
    ok: result.ok,
    output: result.stdout || result.stderr,
  };
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Discovery",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- User configured: ${report.target.userConfigured ? "yes" : "no"}`,
    `- SSH port: ${report.target.port}`,
    `- Deploy root: ${report.target.deployRoot}`,
    `- SSH attempted: ${report.ssh.attempted ? "yes" : "no"}`,
    "",
    "## Result",
    "",
    `- Status: ${report.status}`,
    `- Recommended next step: ${report.recommendedNextStep}`,
  ];

  if (report.warnings.length) {
    lines.push("", "## Warnings", "");
    report.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  if (report.ssh.checks.length) {
    lines.push("", "## SSH Checks", "");
    report.ssh.checks.forEach((check) => {
      lines.push(`### ${check.id}`);
      lines.push("");
      lines.push(`Status: ${check.ok ? "pass" : "warning"}`);
      lines.push("");
      lines.push("```text");
      lines.push(check.output || "No output.");
      lines.push("```");
      lines.push("");
    });
  }

  lines.push(
    "",
    "## Safety",
    "",
    "This discovery report is read-only. It does not deploy, install packages, create directories, copy files, start services or expose the Sentinel API."
  );

  return `${lines.join("\n")}\n`;
}

function writeReports(report) {
  ensureReportsDir();
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownReportPath, buildMarkdown(report));
}

function printReport(report) {
  console.log("Sentinel Raspberry Pi Discovery");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`User configured: ${report.target.userConfigured ? "yes" : "no"}`);
  console.log(`SSH port: ${report.target.port}`);
  console.log(`Deploy root: ${report.target.deployRoot}`);
  console.log(`SSH requested: ${report.ssh.requested ? "yes" : "no"}`);
  console.log(`SSH attempted: ${report.ssh.attempted ? "yes" : "no"}`);
  console.log(`Status: ${report.status}`);
  console.log("");

  if (report.warnings.length) {
    console.log("Warnings:");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
    console.log("");
  }

  if (report.ssh.checks.length) {
    console.log("Read-only SSH checks:");
    report.ssh.checks.forEach((check) => {
      console.log(`- ${check.id}: ${check.ok ? "pass" : "warning"}`);
    });
    console.log("");
  }

  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log("");
  console.log(`Reports written: ${path.relative(repoRoot, jsonReportPath)}, ${path.relative(repoRoot, markdownReportPath)}`);
}

function main() {
  const host = safeEnv("RASPBERRY_PI_HOST") || DEFAULT_HOST;
  const user = safeEnv("RASPBERRY_PI_USER");
  const port = safeEnv("RASPBERRY_PI_SSH_PORT") || DEFAULT_PORT;
  const deployRoot = safeEnv("RASPBERRY_PI_DEPLOY_ROOT") || DEFAULT_DEPLOY_ROOT;
  const requestedSsh = hasFlag("--ssh");
  const warnings = [];
  const checks = [];

  if (!safeEnv("RASPBERRY_PI_HOST")) {
    warnings.push(`RASPBERRY_PI_HOST is not set. Using default target ${DEFAULT_HOST}.`);
  }

  if (!user) {
    warnings.push("RASPBERRY_PI_USER is not set. SSH discovery is unavailable until a user is provided outside the repo.");
  }

  if (!safeEnv("RASPBERRY_PI_DEPLOY_ROOT")) {
    warnings.push(`RASPBERRY_PI_DEPLOY_ROOT is not set. Using planning default ${DEFAULT_DEPLOY_ROOT}.`);
  }

  if (requestedSsh && !user) {
    warnings.push("--ssh was requested, but SSH was not attempted because RASPBERRY_PI_USER is missing.");
  }

  const sshAttempted = requestedSsh && Boolean(user);
  if (sshAttempted) {
    readOnlyChecks.forEach((check) => {
      checks.push(runSshCheck({ host, user, port, check }));
    });

    if (checks.some((check) => !check.ok)) {
      warnings.push("One or more read-only SSH checks returned a warning or failed. No retry or password prompt was attempted.");
    }
  }

  const status = warnings.length ? "warning" : "pass";
  const recommendedNextStep = sshAttempted
    ? "Review the read-only discovery output before planning any Raspberry Pi deployment task."
    : "Set RASPBERRY_PI_USER outside the repo and rerun with --ssh only when read-only SSH discovery is explicitly approved.";

  const report = {
    generatedAt: new Date().toISOString(),
    status,
    target: {
      host,
      userConfigured: Boolean(user),
      sshPortConfigured: Boolean(safeEnv("RASPBERRY_PI_SSH_PORT")),
      port,
      deployRoot,
    },
    ssh: {
      requested: requestedSsh,
      attempted: sshAttempted,
      checks,
    },
    warnings,
    recommendedNextStep,
    safety: {
      readOnly: true,
      deploys: false,
      installsPackages: false,
      createsDirectories: false,
      copiesFiles: false,
      startsServices: false,
      exposesApi: false,
      printsSecrets: false,
    },
  };

  writeReports(report);
  printReport(report);
}

main();
