import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const discoveryPath = path.join(reportsDir, "sentinel-pi-discovery.json");
const preparationPath = path.join(reportsDir, "sentinel-pi-preparation-plan.json");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-install-dry-run.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-install-dry-run.md");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const deployRoot = "/srv/matthew-platform";
const appPath = `${deployRoot}/apps/seo-ops`;
const dataPath = `${deployRoot}/data/seo-ops`;
const logPath = `${deployRoot}/logs/seo-ops`;

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function checkOutput(discovery, id) {
  return String((discovery?.ssh?.checks || []).find((check) => check.id === id)?.output || "").trim();
}

function detectProjectNodeMajor() {
  const packageJson = readJson(path.join(repoRoot, "package.json"), {});
  const engines = packageJson.engines?.node || "";

  return {
    engines,
    preferredMajor: "22 LTS",
    alternativeMajor: "24 LTS",
    rationale: engines
      ? `Project package.json declares Node engine ${engines}. Validate this before installing on the Pi.`
      : "No package.json Node engine is pinned. Node 22 LTS is the safer first Pi target because it is mature LTS; Node 24 LTS should be validated locally before selecting it for the server.",
  };
}

function buildSections({ host, user, nodeChoice }) {
  return [
    {
      id: "preflight",
      title: "Preflight",
      notes: [
        "Confirm the target host, SSH user and backup approach before any mutation.",
        "Confirm no public reverse proxy points at Sentinel.",
        "These commands are review material only and are not executed by this dry-run.",
      ],
      commands: [
        `ssh -o BatchMode=yes -o PasswordAuthentication=no ${user}@${host} hostname`,
        `ssh ${user}@${host} 'df -h / && free -h && git --version && systemctl --version | head -1'`,
        "npm run platform:deploy:ready",
      ],
    },
    {
      id: "node-npm",
      title: "Node/npm Install Plan",
      notes: [
        `Recommended first target: ${nodeChoice.preferredMajor}.`,
        `Alternative after local validation: ${nodeChoice.alternativeMajor}.`,
        nodeChoice.rationale,
        "Final Node major choice must be validated locally before installing on the Pi.",
        "Do not run these commands until a preparation task is approved.",
      ],
      commands: [
        "# Example NodeSource flow for Debian Bookworm aarch64. Review current NodeSource instructions before use.",
        "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -",
        "sudo apt-get install -y nodejs",
        "node -v",
        "npm -v",
      ],
    },
    {
      id: "directories",
      title: "Directory Creation Plan",
      notes: [
        "Create only the Sentinel directories needed by the app, data, reports, backups and logs.",
        "Ownership should be deliberate. Start with the current SSH user for first smoke testing unless a dedicated service user is approved.",
      ],
      commands: [
        `sudo mkdir -p ${appPath}`,
        `sudo mkdir -p ${dataPath}/backups`,
        `sudo mkdir -p ${dataPath}/reports`,
        `sudo mkdir -p ${logPath}`,
        `sudo chown -R ${user}:${user} ${deployRoot}`,
        `find ${deployRoot} -maxdepth 3 -type d -print`,
      ],
    },
    {
      id: "repo",
      title: "Repo Deployment Plan",
      notes: [
        "Use clone for first install or pull for later updates.",
        "Create the Pi .env manually on the Pi. Do not commit it or print secrets.",
      ],
      commands: [
        `git clone https://github.com/torncheesecake/erp-experts.git ${appPath}`,
        `cd ${appPath}`,
        "npm ci",
        "npm run build",
        "npm run platform:init",
        "npm run platform:health",
      ],
    },
    {
      id: "api-smoke",
      title: "API Smoke Plan",
      notes: [
        "Run the API in the foreground first and keep it bound to 127.0.0.1.",
        "Only install systemd after the foreground smoke test passes.",
      ],
      commands: [
        `cd ${appPath}`,
        "SENTINEL_API_HOST=127.0.0.1 SENTINEL_API_PORT=4317 npm run platform:api:serve",
        "npm run platform:api:smoke",
        "curl -s http://127.0.0.1:4317/health",
      ],
    },
    {
      id: "service",
      title: "Service Install Plan",
      notes: [
        "Install the systemd service only after API smoke passes.",
        "Review deploy/systemd/sentinel-api.service.example before copying it.",
        "Do not expose the API publicly.",
      ],
      commands: [
        "sudo cp deploy/systemd/sentinel-api.service.example /etc/systemd/system/sentinel-api.service",
        "sudo systemctl daemon-reload",
        "sudo systemctl enable sentinel-api",
        "sudo systemctl start sentinel-api",
        "sudo systemctl status sentinel-api",
        "npm run platform:api:smoke",
      ],
    },
    {
      id: "post-install",
      title: "Post-install Checks",
      notes: [
        "Run local and Pi-side checks before considering any route or timer changes.",
        "Do not enable cadence timers until service health, backups and restore simulation are proven.",
      ],
      commands: [
        "npm run platform:doctor",
        "npm run platform:deploy:ready",
        "npm run backup:verify",
        "npm run backup:restore:test",
        "npm run seo:monitor",
      ],
    },
  ];
}

function buildReport() {
  const discovery = readJson(discoveryPath, {});
  const preparation = readJson(preparationPath, {});
  const host = preparation.inventory?.host || discovery.target?.host || defaultHost;
  const hostname = preparation.inventory?.hostname || checkOutput(discovery, "hostname") || "unknown";
  const user = process.env.RASPBERRY_PI_USER || defaultUser;
  const nodeChoice = detectProjectNodeMajor();
  const sections = buildSections({ host, user, nodeChoice });

  return {
    generatedAt: new Date().toISOString(),
    dryRunOnly: true,
    mutationPerformed: false,
    sshAttempted: false,
    sourceReports: {
      discovery: fs.existsSync(discoveryPath) ? path.relative(repoRoot, discoveryPath) : null,
      preparation: fs.existsSync(preparationPath) ? path.relative(repoRoot, preparationPath) : null,
    },
    target: {
      host,
      hostname,
      sshUser: user,
      deployRoot,
      appPath,
      dataPath,
      logPath,
    },
    currentState: {
      osKernel: preparation.inventory?.osKernel || checkOutput(discovery, "uname") || "unknown",
      git: preparation.inventory?.git || checkOutput(discovery, "git") || "unknown",
      node: preparation.inventory?.node || { installed: false, version: "not detected" },
      npm: preparation.inventory?.npm || { installed: false, version: "not detected" },
      deployRoot: preparation.inventory?.deployRoot || { path: deployRoot, exists: false },
      blockers: preparation.blockers || [],
    },
    nodeChoice,
    sections,
    safetyNotes: [
      "Generated commands are not executed by this command.",
      "Review every command before running anything on the Pi.",
      "The Sentinel API must bind to 127.0.0.1.",
      "Do not expose a reverse proxy yet.",
      "Do not enable cadence timers yet.",
      "Do not commit .env, platform.db, generated reports or secrets.",
    ],
    recommendedNextStep: "Review this dry-run plan, validate the Node major locally, then approve a separate Pi preparation task before running any commands.",
  };
}

function fencedCommands(commands) {
  return ["```bash", ...commands, "```"].join("\n");
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Install Dry-run",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "This is a dry-run command plan only. It does not SSH, install packages, create directories, clone repositories, copy files, start services, expose the API or mutate the Raspberry Pi.",
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- Hostname: ${report.target.hostname}`,
    `- SSH user assumption: ${report.target.sshUser}`,
    `- Deploy root: ${report.target.deployRoot}`,
    "",
    "## Current Blockers",
    "",
    ...(report.currentState.blockers.length ? report.currentState.blockers.map((blocker) => `- ${blocker}`) : ["- No preparation blockers were available. Regenerate the preparation report before using this plan."]),
    "",
    "## Node Target",
    "",
    `- Recommended first target: ${report.nodeChoice.preferredMajor}`,
    `- Alternative after validation: ${report.nodeChoice.alternativeMajor}`,
    `- Rationale: ${report.nodeChoice.rationale}`,
  ];

  report.sections.forEach((section) => {
    lines.push("", `## ${section.title}`, "");
    section.notes.forEach((note) => lines.push(`- ${note}`));
    lines.push("", fencedCommands(section.commands));
  });

  lines.push("", "## Safety Notes", "");
  report.safetyNotes.forEach((note) => lines.push(`- ${note}`));
  lines.push("", "## Recommended Next Step", "", report.recommendedNextStep, "");
  return `${lines.join("\n")}\n`;
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownReportPath, buildMarkdown(report), "utf8");
}

function printSummary(report) {
  console.log("Sentinel Raspberry Pi Install Dry-run");
  console.log("");
  console.log(`Target: ${report.target.sshUser}@${report.target.host} (${report.target.hostname})`);
  console.log(`Deploy root: ${report.target.deployRoot}`);
  console.log(`Node target: ${report.nodeChoice.preferredMajor}`);
  console.log("");
  console.log("Sections:");
  report.sections.forEach((section) => {
    console.log(`- ${section.title}: ${section.commands.length} proposed commands`);
  });
  console.log("");
  console.log("Safety: dry-run only. No SSH or Pi mutation performed.");
  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const report = buildReport();
  writeReports(report);
  printSummary(report);
}

main();
