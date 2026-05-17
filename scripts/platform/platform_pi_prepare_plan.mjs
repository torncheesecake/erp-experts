import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const discoveryPath = path.join(reportsDir, "sentinel-pi-discovery.json");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-preparation-plan.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-preparation-plan.md");

const fallbackDiscovery = {
  generatedAt: null,
  status: "missing",
  target: {
    host: "192.168.4.22",
    port: "22",
    deployRoot: "/srv/matthew-platform",
  },
  ssh: {
    requested: false,
    attempted: false,
    checks: [],
  },
  warnings: ["No sentinel-pi-discovery.json report was found. Run npm run platform:pi:discover -- --ssh first."],
};

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function checkMap(discovery) {
  return Object.fromEntries((discovery.ssh?.checks || []).map((check) => [check.id, check]));
}

function outputFor(checks, id) {
  return String(checks[id]?.output || "").trim();
}

function lineIncludes(output, needle) {
  return output.split(/\r?\n/).some((line) => line.includes(needle));
}

function detectNodeStatus(checks) {
  const output = outputFor(checks, "node");
  if (/^v\d+\.\d+\.\d+/.test(output)) {
    return { installed: true, version: output };
  }

  return {
    installed: false,
    version: "not detected",
    note: output || "Discovery produced no Node.js version output. Treat as not installed until verified.",
  };
}

function detectNpmStatus(checks) {
  const output = outputFor(checks, "npm");
  if (/^\d+\.\d+\.\d+/.test(output)) {
    return { installed: true, version: output };
  }

  return {
    installed: false,
    version: "not detected",
    note: output || "Discovery produced no npm version output. Treat as not installed until verified.",
  };
}

function detectPathStatus(checks, targetPath) {
  const output = outputFor(checks, "directories");
  return {
    exists: lineIncludes(output, targetPath),
    output,
  };
}

function buildInventory(discovery, checks) {
  const deployRoot = discovery.target?.deployRoot || "/srv/matthew-platform";
  return {
    discoveryGeneratedAt: discovery.generatedAt,
    host: discovery.target?.host || "192.168.4.22",
    hostname: outputFor(checks, "hostname") || "unknown",
    osKernel: outputFor(checks, "uname") || "unknown",
    node: detectNodeStatus(checks),
    npm: detectNpmStatus(checks),
    git: outputFor(checks, "git") || "unknown",
    disk: outputFor(checks, "disk") || "unknown",
    memory: outputFor(checks, "memory") || "unknown",
    systemd: outputFor(checks, "systemd").split(/\r?\n/)[0] || "unknown",
    srv: detectPathStatus(checks, "/srv"),
    deployRoot: {
      path: deployRoot,
      ...detectPathStatus(checks, deployRoot),
    },
    sentinelApiPort: "closed or not running based on latest scan context",
  };
}

function buildBlockers(inventory, discovery) {
  const blockers = [];

  if (discovery.status !== "pass") {
    blockers.push("Latest Pi discovery report is not passing. Rerun read-only SSH discovery before preparation.");
  }

  if (!inventory.node.installed) {
    blockers.push("Node.js is not installed or was not detected on the Pi.");
  }

  if (!inventory.npm.installed) {
    blockers.push("npm is not installed or was not detected on the Pi.");
  }

  if (!inventory.deployRoot.exists) {
    blockers.push(`${inventory.deployRoot.path} does not exist yet.`);
  }

  blockers.push("Pi-local .env has not been created under the future app path.");
  blockers.push("Sentinel API service is not installed or running yet.");
  blockers.push("Backups, reports and logs directories have not been created under /srv/matthew-platform/data and /srv/matthew-platform/logs.");

  return blockers;
}

function buildPreparationPlan(discovery) {
  const checks = checkMap(discovery);
  const inventory = buildInventory(discovery, checks);
  const blockers = buildBlockers(inventory, discovery);
  const recommendedNextStep = "Review docs/RASPBERRY_PI_DEPLOYMENT_PREPARATION_PLAN.md, then create a separate approved preparation task for Node/npm installation and directory setup.";

  return {
    generatedAt: new Date().toISOString(),
    planningOnly: true,
    mutationPerformed: false,
    sourceDiscoveryPath: fs.existsSync(discoveryPath) ? path.relative(repoRoot, discoveryPath) : null,
    inventory,
    blockers,
    nodeRecommendation: {
      preferredMajor: "24 LTS",
      fallbackMajor: "22 LTS",
      rationale: "Fresh Debian Bookworm aarch64 deployment should use a current maintained LTS. Verify official Node release status again immediately before installation.",
      installApproach: "Use official Node.js Linux binaries or NodeSource LTS packages for Debian Bookworm aarch64 during an approved preparation task.",
    },
    directoryPlan: [
      "/srv/matthew-platform/apps/seo-ops",
      "/srv/matthew-platform/data/seo-ops/backups",
      "/srv/matthew-platform/data/seo-ops/reports",
      "/srv/matthew-platform/logs/seo-ops",
    ],
    proposedSequence: [
      "Install approved Node.js LTS and npm.",
      "Create /srv/matthew-platform directory layout.",
      "Clone or pull repo into /srv/matthew-platform/apps/seo-ops.",
      "Create Pi-local .env outside Git.",
      "Run npm ci.",
      "Run npm run build.",
      "Run npm run platform:init.",
      "Run npm run platform:health, backup checks and seo:monitor.",
      "Smoke test npm run platform:api:serve and npm run platform:api:smoke in foreground.",
      "Install systemd service only after foreground smoke test passes.",
    ],
    doNotDoYet: [
      "Do not expose the Sentinel API publicly.",
      "Do not configure a public reverse proxy yet.",
      "Do not enable cadence timers yet.",
      "Do not migrate production routes yet.",
      "Do not commit .env files, platform.db or generated reports.",
    ],
    recommendedNextStep,
  };
}

function fenced(value) {
  return ["```text", value || "Not available.", "```"].join("\n");
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Preparation Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "This report is generated locally from the latest ignored Pi discovery report. It does not SSH, deploy, install packages, create directories, copy files, start services or expose the API.",
    "",
    "## Inventory",
    "",
    `- Host: ${report.inventory.host}`,
    `- Hostname: ${report.inventory.hostname}`,
    `- Node.js: ${report.inventory.node.installed ? report.inventory.node.version : "not installed or not detected"}`,
    `- npm: ${report.inventory.npm.installed ? report.inventory.npm.version : "not installed or not detected"}`,
    `- Git: ${report.inventory.git}`,
    `- systemd: ${report.inventory.systemd}`,
    `- /srv exists: ${report.inventory.srv.exists ? "yes" : "no"}`,
    `- ${report.inventory.deployRoot.path} exists: ${report.inventory.deployRoot.exists ? "yes" : "no"}`,
    "",
    "### OS and Kernel",
    "",
    fenced(report.inventory.osKernel),
    "",
    "### Disk",
    "",
    fenced(report.inventory.disk),
    "",
    "### Memory",
    "",
    fenced(report.inventory.memory),
    "",
    "## Readiness Blockers",
    "",
    ...report.blockers.map((blocker) => `- ${blocker}`),
    "",
    "## Node/npm Recommendation",
    "",
    `- Preferred: ${report.nodeRecommendation.preferredMajor}`,
    `- Fallback: ${report.nodeRecommendation.fallbackMajor}`,
    `- Approach: ${report.nodeRecommendation.installApproach}`,
    `- Rationale: ${report.nodeRecommendation.rationale}`,
    "",
    "## Directory Plan",
    "",
    ...report.directoryPlan.map((targetPath) => `- ${targetPath}`),
    "",
    "## Proposed Sequence",
    "",
    ...report.proposedSequence.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Do Not Do Yet",
    "",
    ...report.doNotDoYet.map((item) => `- ${item}`),
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

function printSummary(report) {
  console.log("Sentinel Raspberry Pi Preparation Plan");
  console.log("");
  console.log(`Host: ${report.inventory.host}`);
  console.log(`Hostname: ${report.inventory.hostname}`);
  console.log(`Node.js: ${report.inventory.node.installed ? report.inventory.node.version : "not installed or not detected"}`);
  console.log(`npm: ${report.inventory.npm.installed ? report.inventory.npm.version : "not installed or not detected"}`);
  console.log(`${report.inventory.deployRoot.path}: ${report.inventory.deployRoot.exists ? "present" : "missing"}`);
  console.log("");
  console.log("Readiness blockers:");
  report.blockers.forEach((blocker) => console.log(`- ${blocker}`));
  console.log("");
  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const discovery = readJson(discoveryPath, fallbackDiscovery);
  const report = buildPreparationPlan(discovery);
  writeReports(report);
  printSummary(report);
}

main();
