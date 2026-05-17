import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const jsonReportPath = path.join(reportsDir, "sentinel-pi-repo-deploy.json");
const markdownReportPath = path.join(reportsDir, "sentinel-pi-repo-deploy.md");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const maxOutputChars = 12_000;

function parseArgs(argv) {
  return {
    confirm: argv.includes("--confirm"),
  };
}

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

function runLocal(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
    shell: false,
    timeout: options.timeoutMs || 30_000,
  });

  return {
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function gitOutput(args, fallback = "") {
  const result = runLocal("git", args);
  return result.ok ? result.stdout.trim() : fallback;
}

function sshTarget({ user, host }) {
  return `${user}@${host}`;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function redactSecret(value) {
  return String(value)
    .replace(/(https?:\/\/)([^/@\s]+)@/gi, "$1[redacted]@")
    .replace(/([?&](?:token|key|password|secret)=)[^&\s]+/gi, "$1[redacted]");
}

function trimOutput(value) {
  const text = redactSecret(value || "");
  if (text.length <= maxOutputChars) return text;
  return `${text.slice(0, maxOutputChars)}\n[output truncated]`;
}

function runRemoteReadOnly({ host, user, port, appPath }) {
  if (!host || !user) {
    return { attempted: false, ok: false, exitCode: 1, stdout: "", stderr: "Missing host or user." };
  }

  const command = String.raw`
set +e
APP_PATH=${shellQuote(appPath)}
printf '__sentinel_hostname__='; hostname 2>&1 || true
printf '__sentinel_user__='; id -un 2>&1 || true
printf '__sentinel_node__='; node -v 2>&1 || true
printf '__sentinel_npm__='; npm -v 2>&1 || true
printf '__sentinel_git__='; git --version 2>&1 || true
if [ ! -e "$APP_PATH" ]; then
  printf '__sentinel_app_state__=missing\n'
  printf '__sentinel_app_detail__=path missing\n'
elif [ ! -d "$APP_PATH" ]; then
  printf '__sentinel_app_state__=not_directory\n'
  printf '__sentinel_app_detail__=path exists but is not a directory\n'
elif [ -d "$APP_PATH/.git" ]; then
  printf '__sentinel_app_state__=git_repo\n'
  printf '__sentinel_app_detail__='; (cd "$APP_PATH" && git rev-parse --short HEAD && git branch --show-current && git remote get-url origin) 2>&1 | paste -sd '|' - || true
elif [ -z "$(find "$APP_PATH" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]; then
  printf '__sentinel_app_state__=empty\n'
  printf '__sentinel_app_detail__=directory exists and is empty\n'
else
  printf '__sentinel_app_state__=non_empty_non_git\n'
  printf '__sentinel_app_detail__='; find "$APP_PATH" -mindepth 1 -maxdepth 1 -printf '%f ' 2>/dev/null | head -c 500; printf '\n'
fi
printf '__sentinel_app_ls__='; ls -ld "$APP_PATH" 2>&1 || true
`;

  const result = runLocal("ssh", [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(port),
    sshTarget({ user, host }),
    command,
  ], { timeoutMs: 30_000 });

  return { attempted: true, ...result };
}

function runRemoteMutation({ host, user, port, command }) {
  const result = runLocal("ssh", [
    "-o", "BatchMode=yes",
    "-o", "PasswordAuthentication=no",
    "-o", "ConnectTimeout=8",
    "-p", String(port),
    sshTarget({ user, host }),
    command,
  ], { timeoutMs: 20 * 60_000 });

  return { attempted: true, ...result };
}

function parseMarkers(stdout) {
  const values = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^__sentinel_([^=]+)__=(.*)$/);
    if (match) values[match[1]] = redactSecret(match[2].trim());
  }
  return values;
}

function classifyStrategy(appState) {
  if (appState === "missing" || appState === "empty") return "clone";
  if (appState === "git_repo") return "pull";
  if (appState === "not_directory" || appState === "non_empty_non_git") return "refuse";
  return "unknown";
}

function buildPlannedCommands({ remoteUrl, branch, appPath, strategy }) {
  const safeRemote = redactSecret(remoteUrl);
  const commands = [];
  if (strategy === "clone") {
    commands.push(`git clone ${safeRemote} ${appPath}`);
  } else if (strategy === "pull") {
    commands.push(`cd ${appPath}`);
    commands.push("git fetch --all --prune");
    commands.push(`git checkout ${branch}`);
    commands.push(`git pull --ff-only origin ${branch}`);
  } else {
    commands.push("Refuse deployment until app path state is resolved.");
  }

  if (strategy === "clone") commands.push(`cd ${appPath}`);
  if (strategy === "clone" || strategy === "pull") {
    commands.push("npm ci");
    commands.push("npm run build");
    commands.push("npm run platform:init");
    commands.push("npm run platform:health");
  }

  return commands;
}

function buildRemoteDeployCommand({ remoteUrl, branch, appPath, strategy }) {
  const lines = [
    "set -euo pipefail",
    `APP_PATH=${shellQuote(appPath)}`,
  ];

  if (strategy === "clone") {
    lines.push("mkdir -p \"$(dirname \"$APP_PATH\")\"");
    lines.push("if [ -e \"$APP_PATH\" ] && [ -n \"$(find \"$APP_PATH\" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)\" ]; then echo 'App path is not empty; refusing clone.' >&2; exit 20; fi");
    lines.push(`git clone ${shellQuote(remoteUrl)} "$APP_PATH"`);
  } else if (strategy === "pull") {
    lines.push("cd \"$APP_PATH\"");
    lines.push("git fetch --all --prune");
    lines.push(`git checkout ${shellQuote(branch)}`);
    lines.push(`git pull --ff-only origin ${shellQuote(branch)}`);
  }

  lines.push("cd \"$APP_PATH\"");
  lines.push("npm ci");
  lines.push("npm run build");
  lines.push("npm run platform:init");
  lines.push("npm run platform:health");
  lines.push("git rev-parse --short HEAD");

  return lines.join("\n");
}

function collectContext() {
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const port = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const remoteUrl = gitOutput(["remote", "get-url", "origin"], "unknown");
  const branch = gitOutput(["branch", "--show-current"], "unknown");
  const latestCommit = gitOutput(["rev-parse", "--short", "HEAD"], "unknown");
  const latestCommitMessage = gitOutput(["log", "-1", "--pretty=%s"], "unknown");
  const gitStatus = gitOutput(["status", "--short"], "");
  const sshResult = runRemoteReadOnly({ host, user, port, appPath });
  const remote = sshResult.ok ? parseMarkers(sshResult.stdout) : {};
  const appState = remote.app_state || (sshResult.ok ? "unknown" : "unavailable");
  const strategy = classifyStrategy(appState);
  const plannedCommands = buildPlannedCommands({ remoteUrl, branch, appPath, strategy });

  return {
    host,
    user,
    port,
    appPath,
    remoteUrl,
    branch,
    latestCommit,
    latestCommitMessage,
    gitStatus,
    sshResult,
    remote,
    appState,
    strategy,
    plannedCommands,
  };
}

function buildBaseReport(context, args) {
  const warnings = [];
  const blockers = [];

  if (!context.host) blockers.push("RASPBERRY_PI_HOST is missing.");
  if (!context.user) blockers.push("RASPBERRY_PI_USER is missing.");
  if (!context.sshResult.ok) blockers.push("Could not inspect the Pi app path over read-only SSH.");
  if (context.strategy === "refuse") blockers.push(`App path state is ${context.appState}; refusing deploy until the path is cleaned or reviewed.`);
  if (context.strategy === "unknown") blockers.push("App path state is unknown; refusing deploy until it can be classified.");
  if (context.remoteUrl === "unknown") blockers.push("Local git origin remote could not be detected.");
  if (context.branch === "unknown") blockers.push("Local git branch could not be detected.");
  if (context.gitStatus.trim()) blockers.push("Local tracked worktree is not clean. Commit or stash tracked changes before confirmed Pi deployment.");

  warnings.push("No API start, systemd service install, timer enablement or public exposure is included.");
  warnings.push("Confirm the Pi has read access to the Git remote before any confirmed clone or pull.");
  warnings.push("Current platform:init uses the repo-local SQLite default. Review DB placement before relying on server persistence under /srv/sentinel/data/seo-ops.");

  return {
    generatedAt: new Date().toISOString(),
    mode: args.confirm ? "confirmed" : "dry-run",
    mutationPerformed: false,
    target: {
      host: context.host,
      sshUser: context.user,
      sshPort: context.port,
      appPath: context.appPath,
    },
    localGit: {
      remoteUrl: redactSecret(context.remoteUrl),
      remoteUrlRedacted: redactSecret(context.remoteUrl) !== context.remoteUrl,
      branch: context.branch,
      latestCommit: context.latestCommit,
      latestCommitMessage: context.latestCommitMessage,
      statusShort: context.gitStatus.trim(),
      clean: !context.gitStatus.trim(),
    },
    ssh: {
      attempted: context.sshResult.attempted,
      ok: context.sshResult.ok,
      exitCode: context.sshResult.exitCode,
      stderr: trimOutput(context.sshResult.stderr).trim(),
    },
    remote: {
      hostname: context.remote.hostname || "unknown",
      user: context.remote.user || "unknown",
      node: context.remote.node || "unknown",
      npm: context.remote.npm || "unknown",
      git: context.remote.git || "unknown",
      appState: context.appState,
      appDetail: context.remote.app_detail || "",
      appListing: context.remote.app_ls || "",
    },
    deploymentStrategy: context.strategy,
    plannedCommands: context.plannedCommands,
    commandResult: null,
    blockers,
    warnings,
    safety: {
      allowArbitraryShell: false,
      startsApi: false,
      installsService: false,
      enablesTimers: false,
      exposesApi: false,
      commitsEnv: false,
      requiresConfirmForMutation: true,
    },
    recommendedNextStep: args.confirm
      ? "Review deployment result before planning API smoke or service installation."
      : "Dry-run only. Use --confirm only after explicitly approving repo deployment.",
  };
}

function runConfirmedDeploy(context, report) {
  if (report.blockers.length) {
    report.commandResult = { attempted: false, ok: false, exitCode: 1, stdoutExcerpt: "", stderrExcerpt: "Blocked before mutation." };
    return report;
  }

  const command = buildRemoteDeployCommand({
    remoteUrl: context.remoteUrl,
    branch: context.branch,
    appPath: context.appPath,
    strategy: context.strategy,
  });
  const result = runRemoteMutation({ host: context.host, user: context.user, port: context.port, command });

  report.mutationPerformed = result.attempted;
  report.commandResult = {
    attempted: true,
    ok: result.ok,
    exitCode: result.exitCode,
    stdoutExcerpt: trimOutput(result.stdout),
    stderrExcerpt: trimOutput(result.stderr),
  };

  if (!result.ok) {
    report.blockers.push(`Confirmed repo deployment failed with exit code ${result.exitCode}.`);
    report.recommendedNextStep = "Review the capped output excerpt and rerun the read-only repo plan before trying again.";
  } else {
    report.recommendedNextStep = "Run read-only verification before planning API smoke or service installation.";
  }

  return report;
}

function fencedCommands(commands) {
  return ["```bash", ...commands, "```"].join("\n");
}

function buildMarkdown(report) {
  const lines = [
    "# Sentinel Raspberry Pi Repo Deploy",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Mode: ${report.mode}`,
    `Mutation performed: ${report.mutationPerformed ? "yes" : "no"}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- SSH user: ${report.target.sshUser}`,
    `- App path: ${report.target.appPath}`,
    "",
    "## Local Git",
    "",
    `- Remote: ${report.localGit.remoteUrl}`,
    `- Branch: ${report.localGit.branch}`,
    `- Latest commit: ${report.localGit.latestCommit} ${report.localGit.latestCommitMessage}`,
    `- Tracked worktree clean: ${report.localGit.clean ? "yes" : "no"}`,
    "",
    "## Pi App Path",
    "",
    `- Hostname: ${report.remote.hostname}`,
    `- Node: ${report.remote.node}`,
    `- npm: ${report.remote.npm}`,
    `- Git: ${report.remote.git}`,
    `- App path state: ${report.remote.appState}`,
    `- Detail: ${report.remote.appDetail || "none"}`,
    "",
    "## Strategy",
    "",
    `- ${report.deploymentStrategy}`,
    "",
    "## Planned Commands",
    "",
    fencedCommands(report.plannedCommands),
    "",
    "## Command Result",
    "",
  ];

  if (report.commandResult?.attempted) {
    lines.push(`- Exit code: ${report.commandResult.exitCode}`);
    lines.push(`- Success: ${report.commandResult.ok ? "yes" : "no"}`);
    lines.push("");
    lines.push("### Stdout Excerpt");
    lines.push("");
    lines.push("```text");
    lines.push(report.commandResult.stdoutExcerpt || "");
    lines.push("```");
    lines.push("");
    lines.push("### Stderr Excerpt");
    lines.push("");
    lines.push("```text");
    lines.push(report.commandResult.stderrExcerpt || "");
    lines.push("```");
  } else {
    lines.push("- Not attempted.");
  }

  lines.push(
    "",
    "## Blockers",
    "",
    ...(report.blockers.length ? report.blockers.map((blocker) => `- ${blocker}`) : ["- None"]),
    "",
    "## Warnings",
    "",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Safety",
    "",
    "- No API start yet.",
    "- No systemd service install yet.",
    "- No public exposure.",
    "- No timer enablement.",
    "- No `.env` commit.",
    "",
    "## Recommended Next Step",
    "",
    report.recommendedNextStep,
  );

  return `${lines.join("\n")}\n`;
}

function writeReports(report) {
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(jsonReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(markdownReportPath, buildMarkdown(report), "utf8");
}

function printReport(report) {
  console.log("Sentinel Raspberry Pi Repo Deploy");
  console.log("");
  console.log(`Mode: ${report.mode}`);
  console.log(`Target: ${report.target.sshUser}@${report.target.host}`);
  console.log(`App path: ${report.target.appPath}`);
  console.log(`Remote: ${report.localGit.remoteUrl}`);
  console.log(`Branch: ${report.localGit.branch}`);
  console.log(`Latest commit: ${report.localGit.latestCommit} ${report.localGit.latestCommitMessage}`);
  console.log(`App path state: ${report.remote.appState}`);
  console.log(`Strategy: ${report.deploymentStrategy}`);
  console.log(`Mutation performed: ${report.mutationPerformed ? "yes" : "no"}`);
  console.log("");

  if (report.mode === "dry-run") {
    console.log("Dry-run only. Refusing to deploy without --confirm.");
    console.log("");
  }

  if (report.commandResult?.attempted) {
    console.log(`Command result: ${report.commandResult.ok ? "pass" : "fail"} (${report.commandResult.exitCode})`);
    console.log("");
  }

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

  console.log("Planned commands:");
  report.plannedCommands.forEach((command) => console.log(`- ${command}`));
  console.log("");
  console.log(`Recommended next step: ${report.recommendedNextStep}`);
  console.log(`Reports written: ${path.relative(repoRoot, markdownReportPath)}, ${path.relative(repoRoot, jsonReportPath)}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const context = collectContext();
  let report = buildBaseReport(context, args);

  if (args.confirm) {
    report = runConfirmedDeploy(context, report);
  }

  writeReports(report);
  printReport(report);

  if (args.confirm && report.blockers.length) process.exitCode = 1;
}

main();
