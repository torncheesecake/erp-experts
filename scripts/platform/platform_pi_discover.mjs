import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import dns from "node:dns/promises";
import { execFileSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const DEFAULT_HOST = "192.168.4.22";
const DEFAULT_PORT = "22";
const DEFAULT_DEPLOY_ROOT = "/srv/matthew-platform";
const DEFAULT_SUBNET_PREFIX = "192.168.4";
const SENTINEL_API_PORT = 4317;
const SCAN_TIMEOUT_MS = 180;
const SCAN_CONCURRENCY = 64;
const MAX_SCAN_HOSTS = 512;
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

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index === process.argv.length - 1) {
    return "";
  }

  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : "";
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

function ipToNumber(ip) {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function numberToIp(number) {
  return [24, 16, 8, 0].map((shift) => (number >>> shift) & 255).join(".");
}

function buildScanHosts(subnetInput, warnings) {
  const input = String(subnetInput || DEFAULT_SUBNET_PREFIX).trim();

  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input)) {
    return {
      rangeLabel: `${input}.1-254`,
      hosts: Array.from({ length: 254 }, (_, index) => `${input}.${index + 1}`),
    };
  }

  const cidrMatch = input.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!cidrMatch) {
    warnings.push(`Invalid --subnet value "${input}". Falling back to ${DEFAULT_SUBNET_PREFIX}.1-254.`);
    return buildScanHosts(DEFAULT_SUBNET_PREFIX, warnings);
  }

  const [, baseIp, prefixText] = cidrMatch;
  const prefix = Number(prefixText);
  if (prefix < 16 || prefix > 30) {
    warnings.push(`Unsupported CIDR prefix /${prefix}. Use a local subnet between /16 and /30. Falling back to ${DEFAULT_SUBNET_PREFIX}.1-254.`);
    return buildScanHosts(DEFAULT_SUBNET_PREFIX, warnings);
  }

  const hostCount = 2 ** (32 - prefix);
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  const network = ipToNumber(baseIp) & mask;
  const first = network + 1;
  const last = network + hostCount - 2;
  const hosts = [];

  for (let current = first; current <= last && hosts.length < MAX_SCAN_HOSTS; current += 1) {
    hosts.push(numberToIp(current));
  }

  if (last - first + 1 > MAX_SCAN_HOSTS) {
    warnings.push(`Scan range ${input} contains more than ${MAX_SCAN_HOSTS} hosts. Only the first ${MAX_SCAN_HOSTS} usable addresses were checked.`);
  }

  return {
    rangeLabel: `${input} (${hosts[0]}-${hosts[hosts.length - 1]})`,
    hosts,
  };
}

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: SCAN_TIMEOUT_MS });
    let settled = false;

    const finish = (open) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(open);
    };

    socket.on("connect", () => finish(true));
    socket.on("timeout", () => finish(false));
    socket.on("error", () => finish(false));
  });
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

async function reverseDns(host) {
  const result = await withTimeout(dns.reverse(host).catch(() => []), 300);
  return Array.isArray(result) && result.length ? result[0] : "";
}

async function runPool(items, worker, concurrency = SCAN_CONCURRENCY) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => next());
  await Promise.all(workers);
  return results;
}

async function scanNetwork({ subnetInput, knownHost, warnings }) {
  const { rangeLabel, hosts } = buildScanHosts(subnetInput, warnings);
  const checkedAt = new Date().toISOString();
  const candidates = [];

  await runPool(hosts, async (host) => {
    const sshOpen = await checkPort(host, Number(DEFAULT_PORT));
    const apiOpen = await checkPort(host, SENTINEL_API_PORT);

    if (!sshOpen && !apiOpen) {
      return null;
    }

    const reverseName = sshOpen ? await reverseDns(host) : "";
    const candidate = {
      ip: host,
      sshPortOpen: sshOpen,
      sentinelApiPortOpen: apiOpen,
      reverseDns: reverseName,
      preferredKnownHost: host === knownHost,
    };
    candidates.push(candidate);
    return candidate;
  });

  candidates.sort((a, b) => {
    if (a.preferredKnownHost !== b.preferredKnownHost) {
      return a.preferredKnownHost ? -1 : 1;
    }

    if (a.sshPortOpen !== b.sshPortOpen) {
      return a.sshPortOpen ? -1 : 1;
    }

    return ipToNumber(a.ip) - ipToNumber(b.ip);
  });

  const preferredCandidate = candidates.find((candidate) => candidate.preferredKnownHost)
    || candidates.find((candidate) => candidate.sshPortOpen)
    || candidates[0]
    || null;

  return {
    attempted: true,
    checkedAt,
    scannedRange: rangeLabel,
    hostCount: hosts.length,
    portsChecked: [Number(DEFAULT_PORT), SENTINEL_API_PORT],
    candidates,
    preferredCandidate,
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
    `- Scan attempted: ${report.scan.attempted ? "yes" : "no"}`,
    `- Scanned range: ${report.scan.scannedRange || "not run"}`,
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

  if (report.scan.attempted) {
    lines.push("", "## Network Scan", "");
    lines.push(`- Hosts checked: ${report.scan.hostCount}`);
    lines.push(`- Ports checked: ${report.scan.portsChecked.join(", ")}`);
    lines.push(`- Candidates found: ${report.scan.candidates.length}`);
    if (report.scan.preferredCandidate) {
      lines.push(`- Preferred candidate: ${report.scan.preferredCandidate.ip}`);
    }

    if (report.scan.candidates.length) {
      lines.push("", "| IP | SSH 22 | Sentinel API 4317 | Reverse DNS | Preferred |");
      lines.push("| --- | --- | --- | --- | --- |");
      report.scan.candidates.forEach((candidate) => {
        lines.push(`| ${candidate.ip} | ${candidate.sshPortOpen ? "open" : "closed"} | ${candidate.sentinelApiPortOpen ? "open" : "closed"} | ${candidate.reverseDns || ""} | ${candidate.preferredKnownHost ? "yes" : "no"} |`);
      });
    }
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
  console.log(`Scan requested: ${report.scan.requested ? "yes" : "no"}`);
  console.log(`Scan attempted: ${report.scan.attempted ? "yes" : "no"}`);
  if (report.scan.attempted) {
    console.log(`Scanned range: ${report.scan.scannedRange}`);
    console.log(`Scan candidates: ${report.scan.candidates.length}`);
    if (report.scan.preferredCandidate) {
      console.log(`Preferred candidate: ${report.scan.preferredCandidate.ip}`);
    }
  }
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

  if (report.scan.candidates.length) {
    console.log("Network candidates:");
    report.scan.candidates.forEach((candidate) => {
      const markers = [
        candidate.sshPortOpen ? "ssh:open" : "ssh:closed",
        candidate.sentinelApiPortOpen ? "api:open" : "api:closed",
        candidate.preferredKnownHost ? "preferred" : "",
      ].filter(Boolean);
      console.log(`- ${candidate.ip}: ${markers.join(", ")}`);
    });
    console.log("");
  }

  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log("");
  console.log(`Reports written: ${path.relative(repoRoot, jsonReportPath)}, ${path.relative(repoRoot, markdownReportPath)}`);
}

async function main() {
  const host = safeEnv("RASPBERRY_PI_HOST") || DEFAULT_HOST;
  const user = safeEnv("RASPBERRY_PI_USER");
  const port = safeEnv("RASPBERRY_PI_SSH_PORT") || DEFAULT_PORT;
  const deployRoot = safeEnv("RASPBERRY_PI_DEPLOY_ROOT") || DEFAULT_DEPLOY_ROOT;
  const requestedSsh = hasFlag("--ssh");
  const requestedScan = hasFlag("--scan");
  const subnetInput = getArgValue("--subnet") || DEFAULT_SUBNET_PREFIX;
  const warnings = [];
  const checks = [];
  let scan = {
    requested: requestedScan,
    attempted: false,
    checkedAt: null,
    scannedRange: "",
    hostCount: 0,
    portsChecked: [Number(DEFAULT_PORT), SENTINEL_API_PORT],
    candidates: [],
    preferredCandidate: null,
  };

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
  if (requestedScan) {
    scan = {
      requested: true,
      ...(await scanNetwork({ subnetInput, knownHost: host, warnings })),
    };

    if (!scan.candidates.length) {
      warnings.push(`No SSH or Sentinel API candidates were found on ${scan.scannedRange}. Confirm the Pi is online or set RASPBERRY_PI_HOST in local .env.`);
    }
  }

  if (sshAttempted) {
    readOnlyChecks.forEach((check) => {
      checks.push(runSshCheck({ host, user, port, check }));
    });

    if (checks.some((check) => !check.ok)) {
      warnings.push("One or more read-only SSH checks returned a warning or failed. No retry or password prompt was attempted.");
    }
  }

  const status = warnings.length ? "warning" : "pass";
  let recommendedNextStep = "Set RASPBERRY_PI_USER outside the repo and rerun with --ssh only when read-only SSH discovery is explicitly approved.";
  if (sshAttempted) {
    recommendedNextStep = "Review the read-only discovery output before planning any Raspberry Pi deployment task.";
  } else if (scan.attempted && scan.preferredCandidate) {
    recommendedNextStep = `Set RASPBERRY_PI_HOST=${scan.preferredCandidate.ip} in local .env if this candidate is confirmed, then run platform:pi:discover -- --ssh when read-only SSH discovery is approved.`;
  } else if (scan.attempted) {
    recommendedNextStep = "Confirm the Pi is online, consider a DHCP reservation or static lease, then rerun platform:pi:discover -- --scan.";
  }

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
    scan,
    scanAttempted: scan.attempted,
    scannedRange: scan.scannedRange,
    candidates: scan.candidates,
    preferredCandidate: scan.preferredCandidate,
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
