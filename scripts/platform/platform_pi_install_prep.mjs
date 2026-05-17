import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const preflightPath = path.join(reportsDir, "sentinel-pi-install-preflight.json");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-install-prep.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-install-prep.md");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const deployRoot = "/srv/sentinel";
const sshPortDefault = "22";
const allowedNodeVersions = new Set(["22", "24"]);

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getArgValue(flag, fallback = "") {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index === process.argv.length - 1) return fallback;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : fallback;
}

function envValue(name) {
  return process.env[name] && String(process.env[name]).trim() ? String(process.env[name]).trim() : "";
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function sshTarget({ user, host }) {
  return `${user}@${host}`;
}

function runLocal(command, args, timeoutMs = 20_000) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
    timeout: timeoutMs,
  });

  return {
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function runSsh({ host, user, sshPort, remoteCommand, timeoutMs = 120_000 }) {
  return runLocal("ssh", [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(sshPort),
    sshTarget({ user, host }),
    remoteCommand,
  ], timeoutMs);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function buildRemoteCommands({ user, nodeVersion }) {
  const directories = [
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

  return [
    {
      id: "verify-host-user",
      title: "Verify host and user",
      mutates: false,
      command: "hostname && id -un && uname -m && git --version && systemctl --version | head -1",
    },
    {
      id: "install-node",
      title: `Install Node.js ${nodeVersion}.x and npm`,
      mutates: true,
      command: [
        "set -e",
        `curl -fsSL https://deb.nodesource.com/setup_${nodeVersion}.x | sudo -E bash -`,
        "sudo apt-get install -y nodejs",
      ].join(" && "),
    },
    {
      id: "create-directories",
      title: "Create Sentinel directories",
      mutates: true,
      command: [
        "set -e",
        `sudo mkdir -p ${directories.map(shellQuote).join(" ")}`,
        `sudo chown -R ${shellQuote(`${user}:${user}`)} ${shellQuote(deployRoot)}`,
      ].join(" && "),
    },
    {
      id: "post-checks",
      title: "Run post-checks",
      mutates: false,
      command: [
        "set -e",
        "node -v",
        "npm -v",
        `ls -ld ${shellQuote(deployRoot)} ${shellQuote(`${deployRoot}/apps/seo-ops`)} ${shellQuote(`${deployRoot}/data/seo-ops/backups`)} ${shellQuote(`${deployRoot}/data/seo-ops/reports`)} ${shellQuote(`${deployRoot}/logs/seo-ops`)}`,
      ].join(" && "),
    },
  ];
}

function summariseCommand(command) {
  return command
    .replace(/curl -fsSL https:\/\/deb\.nodesource\.com\/setup_\d+\.x \| sudo -E bash -/, "curl NodeSource setup script for selected Node major")
    .replace(/sudo apt-get install -y nodejs/, "sudo apt-get install -y nodejs")
    .replace(/\s+/g, " ")
    .trim();
}

function validateInputs({ host, user, nodeVersion, confirmed, preflight }) {
  const blockers = [];
  const warnings = [];

  if (!host && confirmed) {
    blockers.push("RASPBERRY_PI_HOST is missing from the local environment.");
  } else if (!host) {
    warnings.push(`RASPBERRY_PI_HOST is missing. Dry-run will use planning default ${defaultHost}.`);
  }

  if (!user && confirmed) {
    blockers.push("RASPBERRY_PI_USER is missing from the local environment.");
  } else if (!user) {
    warnings.push("RASPBERRY_PI_USER is missing. Dry-run will use planning default matthew.");
  }

  if (!allowedNodeVersions.has(nodeVersion)) blockers.push(`Unsupported --node-version ${nodeVersion}. Use 22 or 24.`);
  if (host && host !== defaultHost) warnings.push(`Host ${host} differs from the known default ${defaultHost}. Proceed only if this is intentional.`);

  if (!preflight && confirmed) {
    blockers.push("No preflight report found. Run npm run platform:pi:install:preflight before confirmed prep.");
  } else if (!preflight) {
    warnings.push("No preflight report found. Run npm run platform:pi:install:preflight before confirmed prep.");
  } else if (preflight.overallStatus === "NOT_READY") {
    blockers.push("Latest preflight report is NOT_READY.");
  }

  if (!confirmed) {
    warnings.push("Dry-run mode. Add --confirm to perform the Node/npm installation and directory creation after review.");
  }

  return { blockers, warnings };
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Install Prep",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Mode: ${report.mode}`,
    "",
    "This command is dry-run by default. Confirmed mode can install Node/npm and create Sentinel directories on the Pi, but only when `--confirm` is provided. It does not clone the app, start the API, install systemd services or expose anything publicly.",
    "",
    "## Target",
    "",
    `- Host: ${report.target.host || "missing"}`,
    `- User configured: ${report.target.userConfigured ? "yes" : "no"}`,
    `- SSH port: ${report.target.sshPort}`,
    `- Node major: ${report.nodeVersion}`,
    "",
    "## Result",
    "",
    `- Status: ${report.status}`,
    `- Mutation performed: ${report.mutationPerformed ? "yes" : "no"}`,
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((blocker) => `- ${blocker}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Steps",
    "",
    ...report.steps.flatMap((step) => [
      `### ${step.title}`,
      "",
      `- Mutates Pi: ${step.mutates ? "yes" : "no"}`,
      `- Status: ${step.status}`,
      `- Command summary: ${step.commandSummary}`,
      step.outputExcerpt ? `- Output: ${step.outputExcerpt.replace(/\r?\n/g, " ").slice(0, 500)}` : "- Output: not run",
      "",
    ]),
    "## Next Step",
    "",
    report.nextStep,
  ];

  return `${lines.join("\n")}\n`;
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownReportPath, buildMarkdown(report), "utf8");
}

function printReport(report) {
  console.log("Sentinel Raspberry Pi Install Prep");
  console.log("");
  console.log(`Mode: ${report.mode}`);
  console.log(`Host: ${report.target.host || "missing"}`);
  console.log(`User configured: ${report.target.userConfigured ? "yes" : "no"}`);
  console.log(`Node major: ${report.nodeVersion}`);
  console.log(`Status: ${report.status}`);
  console.log(`Mutation performed: ${report.mutationPerformed ? "yes" : "no"}`);
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

  console.log("Planned steps:");
  report.steps.forEach((step) => console.log(`- ${step.title}: ${step.status}`));
  console.log("");
  console.log(`Next step: ${report.nextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const confirmed = hasFlag("--confirm");
  const nodeVersion = getArgValue("--node-version", "22");
  const host = envValue("RASPBERRY_PI_HOST");
  const user = envValue("RASPBERRY_PI_USER");
  const planHost = host || defaultHost;
  const planUser = user || defaultUser;
  const sshPort = envValue("RASPBERRY_PI_SSH_PORT") || sshPortDefault;
  const preflight = readJson(preflightPath, null);
  const inputValidation = validateInputs({ host, user, nodeVersion, confirmed, preflight });
  const plannedCommands = buildRemoteCommands({ user: planUser, nodeVersion });
  const steps = plannedCommands.map((step) => ({
    id: step.id,
    title: step.title,
    mutates: step.mutates,
    status: confirmed && !inputValidation.blockers.length ? "pending" : "planned",
    commandSummary: summariseCommand(step.command),
    outputExcerpt: "",
    exitCode: null,
  }));
  const blockers = [...inputValidation.blockers];
  const warnings = [...inputValidation.warnings];
  let mutationPerformed = false;

  if (confirmed && !blockers.length) {
    console.log("Confirmed mode enabled. Running controlled Raspberry Pi install preparation.");
    console.log("This will install Node/npm and create Sentinel directories only. It will not clone the app, start services or expose the API.");

    for (const [index, planned] of plannedCommands.entries()) {
      const result = runSsh({ host, user, sshPort, remoteCommand: planned.command, timeoutMs: planned.id === "install-node" ? 600_000 : 120_000 });
      steps[index].status = result.ok ? "success" : "failed";
      steps[index].exitCode = result.exitCode;
      steps[index].outputExcerpt = `${result.stdout}${result.stderr}`.trim().slice(0, 2000);

      if (planned.mutates) mutationPerformed = true;
      if (!result.ok) {
        blockers.push(`${planned.title} failed. Stop before continuing.`);
        break;
      }
    }
  }

  const status = blockers.length ? "blocked" : confirmed ? "completed" : "dry-run";
  const report = {
    generatedAt: new Date().toISOString(),
    mode: confirmed ? "confirmed" : "dry-run",
    status,
    mutationPerformed,
    target: {
      host: planHost,
      userConfigured: Boolean(user),
      sshUser: planUser,
      sshPort,
      deployRoot,
    },
    nodeVersion,
    preflight: preflight ? {
      path: path.relative(repoRoot, preflightPath),
      status: preflight.overallStatus || "unknown",
      checkedAt: preflight.checkedAt || null,
    } : null,
    blockers,
    warnings,
    steps,
    nextStep: confirmed
      ? "Review prep results. Do not clone the app or start services until a separate repo deployment task is approved."
      : "Review this dry-run, run platform:pi:install:preflight, then rerun with --confirm only after explicit approval.",
    safety: {
      dryRunByDefault: true,
      requiresConfirmForMutation: true,
      clonesRepo: false,
      startsServices: false,
      exposesApi: false,
      printsSecrets: false,
    },
  };

  writeReports(report);
  printReport(report);

  if (blockers.length) {
    process.exitCode = 1;
  }
}

main();
