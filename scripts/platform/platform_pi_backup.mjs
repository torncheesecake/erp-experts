import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./tenant_config.mjs";

const reportsDir = path.join(repoRoot, "reports");
const envPath = path.join(repoRoot, ".env");
const defaultHost = "192.168.4.22";
const defaultUser = "matthew";
const defaultPort = "22";
const defaultDeployRoot = "/srv/sentinel";
const defaultAppPath = `${defaultDeployRoot}/apps/seo-ops`;
const canonicalDataRoot = `${defaultDeployRoot}/data/seo-ops`;
const canonicalDbPath = `${canonicalDataRoot}/platform.db`;
const canonicalBackupPath = `${canonicalDataRoot}/backups`;
const serviceName = "sentinel-api.service";
const apiHost = "127.0.0.1";
const apiPort = "4317";

function parseArgs(argv) {
  return {
    verify: argv.includes("--verify"),
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

function decodeB64(value) {
  if (!value) return "";
  try {
    return redactSecret(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    return "";
  }
}

function parseJsonPayload(value) {
  const text = decodeB64(value);
  if (!text) return { text: "", json: null };
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
}

function parseRemoteOutput(stdout) {
  const values = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^__sentinel_([^=]+)__=(.*)$/);
    if (match) values[match[1]] = redactSecret(match[2].trim());
  }
  return values;
}

function runSsh({ host, user, sshPort, appPath, script, timeoutMs = 45_000 }) {
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
    input: script({ appPath }),
    shell: false,
    timeout: timeoutMs,
  });

  return {
    attempted: true,
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function readOnlyRemoteScript({ appPath }) {
  const quotedAppPath = shellQuote(appPath);
  return String.raw`set +e
APP_PATH=${quotedAppPath}
CANONICAL_DB=${shellQuote(canonicalDbPath)}
BACKUP_PATH=${shellQuote(canonicalBackupPath)}
ENV_FILE="$APP_PATH/.env"
SERVICE=${shellQuote(serviceName)}
API_HOST=${shellQuote(apiHost)}
API_PORT=${shellQuote(apiPort)}

emit() {
  printf '__sentinel_%s__=%s\n' "$1" "$2"
}

emit_b64() {
  printf '__sentinel_%s_b64__=' "$1"
  printf '%s' "$2" | base64 | tr -d '\n'
  printf '\n'
}

emit shell_ok shell_ok
emit hostname "$(hostname 2>&1 || true)"
emit user "$(id -un 2>&1 || true)"
emit app_path "$APP_PATH"
emit app_exists "$([ -d "$APP_PATH" ] && printf present || printf missing)"
${marker("git_commit", "cd \"$APP_PATH\" 2>/dev/null && git rev-parse --short HEAD")}
${marker("git_status_count", "cd \"$APP_PATH\" 2>/dev/null && git status --short | wc -l | tr -d ' '")}
${marker("env_file", "if [ -f \"$ENV_FILE\" ]; then echo present; else echo missing; fi")}
${marker("env_platform_db_path", "grep -E '^PLATFORM_DB_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("env_backup_path", "grep -E '^PLATFORM_BACKUP_PATH=' \"$ENV_FILE\" 2>/dev/null | tail -n 1 | cut -d= -f2-")}
${marker("canonical_db", "if [ -f \"$CANONICAL_DB\" ]; then echo present; else echo missing; fi")}
${marker("canonical_db_size", "du -h \"$CANONICAL_DB\" 2>/dev/null | cut -f1")}
${marker("canonical_db_bytes", "wc -c < \"$CANONICAL_DB\" 2>/dev/null | tr -d ' '")}
${marker("canonical_db_mtime", "stat -c %y \"$CANONICAL_DB\" 2>/dev/null")}
${marker("backup_path", "if [ -d \"$BACKUP_PATH\" ]; then echo present; else echo missing; fi")}
${marker("backup_path_writable", "if [ -d \"$BACKUP_PATH\" ] && [ -w \"$BACKUP_PATH\" ]; then echo yes; else echo no; fi")}
${marker("backup_count", "find \"$BACKUP_PATH\" -maxdepth 1 -type f -name 'platform.db.backup-*' 2>/dev/null | wc -l | tr -d ' '")}
${marker("sqlite3_path", "command -v sqlite3 || true")}
${marker("sqlite3_version", "sqlite3 --version 2>/dev/null | awk '{print $1}'")}
${marker("db_integrity", "sqlite3 \"$CANONICAL_DB\" 'PRAGMA integrity_check;' 2>&1")}
${marker("service_active", "systemctl is-active \"$SERVICE\" 2>&1")}
${marker("listen_addresses", "ss -ltn | awk '$4 ~ /:4317$/ {print $4}' | paste -sd '|' -")}
LATEST_BACKUPS="$(find "$BACKUP_PATH" -maxdepth 1 -type f -name 'platform.db.backup-*' -printf '%T@ %s %f\n' 2>/dev/null | sort -nr | head -n 5)"
emit_b64 latest_backups "$LATEST_BACKUPS"
LATEST_BACKUP="$(printf '%s\n' "$LATEST_BACKUPS" | head -n 1 | awk '{print $3}')"
if [ -n "$LATEST_BACKUP" ]; then
  emit latest_backup "$LATEST_BACKUP"
  ${marker("latest_backup_integrity", "sqlite3 \"$BACKUP_PATH/$LATEST_BACKUP\" 'PRAGMA integrity_check;' 2>&1")}
else
  emit latest_backup ""
  emit latest_backup_integrity not_checked
fi
RUNTIME_OUTPUT="$(cd "$APP_PATH" 2>/dev/null && set -a && . "$ENV_FILE" 2>/dev/null && set +a && node scripts/platform/platform_runtime_paths.mjs --json 2>&1)"
emit runtime_paths_status "$?"
emit_b64 runtime_paths "$RUNTIME_OUTPUT"
`;
}

function confirmedBackupRemoteScript({ appPath }) {
  const quotedAppPath = shellQuote(appPath);
  return String.raw`set +e
APP_PATH=${quotedAppPath}
CANONICAL_DB=${shellQuote(canonicalDbPath)}
BACKUP_PATH=${shellQuote(canonicalBackupPath)}
ENV_FILE="$APP_PATH/.env"

emit() {
  printf '__sentinel_%s__=%s\n' "$1" "$2"
}

emit_b64() {
  printf '__sentinel_%s_b64__=' "$1"
  printf '%s' "$2" | base64 | tr -d '\n'
  printf '\n'
}

emit shell_ok shell_ok
emit app_path "$APP_PATH"
emit env_file "$([ -f "$ENV_FILE" ] && printf present || printf missing)"
emit env_platform_db_path "$(grep -E '^PLATFORM_DB_PATH=' "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2-)"
emit env_backup_path "$(grep -E '^PLATFORM_BACKUP_PATH=' "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2-)"
emit canonical_db "$([ -f "$CANONICAL_DB" ] && printf present || printf missing)"
${marker("canonical_db_size", "du -h \"$CANONICAL_DB\" 2>/dev/null | cut -f1")}
${marker("canonical_db_bytes", "wc -c < \"$CANONICAL_DB\" 2>/dev/null | tr -d ' '")}
${marker("canonical_db_mtime", "stat -c %y \"$CANONICAL_DB\" 2>/dev/null")}
emit backup_path "$([ -d "$BACKUP_PATH" ] && printf present || printf missing)"
emit backup_path_writable "$([ -d "$BACKUP_PATH" ] && [ -w "$BACKUP_PATH" ] && printf yes || printf no)"
emit sqlite3_path "$(command -v sqlite3 || true)"
${marker("sqlite3_version", "sqlite3 --version 2>/dev/null | awk '{print $1}'")}

if [ ! -f "$ENV_FILE" ]; then
  emit result failed_env_missing
  exit 0
fi

if [ "$(grep -E '^PLATFORM_DB_PATH=' "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2-)" != "$CANONICAL_DB" ]; then
  emit result failed_env_db_path
  exit 0
fi

if [ "$(grep -E '^PLATFORM_BACKUP_PATH=' "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2-)" != "$BACKUP_PATH" ]; then
  emit result failed_env_backup_path
  exit 0
fi

if [ ! -f "$CANONICAL_DB" ]; then
  emit result failed_db_missing
  exit 0
fi

if [ ! -d "$BACKUP_PATH" ] || [ ! -w "$BACKUP_PATH" ]; then
  emit result failed_backup_path
  exit 0
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  emit result failed_sqlite_missing
  exit 0
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_PATH/platform.db.backup-$TIMESTAMP"

if [ -e "$BACKUP_FILE" ]; then
  emit backup_file "$BACKUP_FILE"
  emit result failed_backup_exists
  exit 0
fi

sqlite3 "$CANONICAL_DB" ".backup $BACKUP_FILE" >/tmp/sentinel-pi-backup-sqlite.out 2>&1
BACKUP_STATUS="$?"
emit backup_file "$BACKUP_FILE"
emit sqlite_backup_status "$BACKUP_STATUS"
if [ "$BACKUP_STATUS" -ne 0 ]; then
  emit sqlite_backup_output "$(cat /tmp/sentinel-pi-backup-sqlite.out 2>/dev/null)"
  rm -f /tmp/sentinel-pi-backup-sqlite.out >/dev/null 2>&1 || true
  emit result failed_backup_command
  exit 0
fi
rm -f /tmp/sentinel-pi-backup-sqlite.out >/dev/null 2>&1 || true

INTEGRITY="$(sqlite3 "$BACKUP_FILE" 'PRAGMA integrity_check;' 2>&1)"
emit backup_integrity "$INTEGRITY"
emit backup_size "$(du -h "$BACKUP_FILE" 2>/dev/null | cut -f1)"
emit backup_bytes "$(wc -c < "$BACKUP_FILE" 2>/dev/null | tr -d ' ')"
${marker("db_integrity", "sqlite3 \"$CANONICAL_DB\" 'PRAGMA integrity_check;' 2>&1")}
${marker("service_active", "systemctl is-active \"${serviceName}\" 2>&1")}
${marker("listen_addresses", "ss -ltn | awk '$4 ~ /:4317$/ {print $4}' | paste -sd '|' -")}
${marker("backup_count", "find \"$BACKUP_PATH\" -maxdepth 1 -type f -name 'platform.db.backup-*' 2>/dev/null | wc -l | tr -d ' '")}
LATEST_BACKUPS="$(find "$BACKUP_PATH" -maxdepth 1 -type f -name 'platform.db.backup-*' -printf '%T@ %s %f\n' 2>/dev/null | sort -nr | head -n 5)"
emit_b64 latest_backups "$LATEST_BACKUPS"
LATEST_BACKUP="$(printf '%s\n' "$LATEST_BACKUPS" | head -n 1 | awk '{print $3}')"
if [ -n "$LATEST_BACKUP" ]; then
  emit latest_backup "$LATEST_BACKUP"
  ${marker("latest_backup_integrity", "sqlite3 \"$BACKUP_PATH/$LATEST_BACKUP\" 'PRAGMA integrity_check;' 2>&1")}
else
  emit latest_backup ""
  emit latest_backup_integrity not_checked
fi
RUNTIME_OUTPUT="$(cd "$APP_PATH" 2>/dev/null && set -a && . "$ENV_FILE" 2>/dev/null && set +a && node scripts/platform/platform_runtime_paths.mjs --json 2>&1)"
emit runtime_paths_status "$?"
emit_b64 runtime_paths "$RUNTIME_OUTPUT"

if [ "$INTEGRITY" = "ok" ]; then
  emit result success
else
  emit result failed_integrity
fi
`;
}

function runtimePathValue(runtimeJson, key) {
  if (!runtimeJson || typeof runtimeJson !== "object") return null;
  if (Array.isArray(runtimeJson.paths)) {
    return runtimeJson.paths.find((item) => item?.key === key)?.path || null;
  }
  return runtimeJson.paths?.[key]?.path || null;
}

function latestBackupEntries(remote) {
  const text = decodeB64(remote.latest_backups_b64);
  if (!text.trim()) return [];
  return text.trim().split(/\r?\n/).map((line) => {
    const [mtimeRaw, bytesRaw, ...nameParts] = line.trim().split(/\s+/);
    return {
      name: nameParts.join(" "),
      bytes: Number(bytesRaw || 0),
      modifiedEpoch: Number(mtimeRaw || 0),
    };
  }).filter((entry) => entry.name);
}

function makeCheck(id, label, status, detail) {
  return { id, label, status, detail };
}

function classifyVerify({ host, user, sshResult, remote }) {
  const checks = [];
  const warnings = [];
  const blockers = [];
  const runtime = parseJsonPayload(remote.runtime_paths_b64);
  const runtimeDbPath = runtimePathValue(runtime.json, "db");
  const runtimeBackupPath = runtimePathValue(runtime.json, "backups");
  const latestBackups = latestBackupEntries(remote);

  if (!host) {
    blockers.push("RASPBERRY_PI_HOST is missing.");
    checks.push(makeCheck("host", "Host configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("host", "Host configured", "pass", host));
  }

  if (!user) {
    blockers.push("RASPBERRY_PI_USER is missing.");
    checks.push(makeCheck("user", "User configured", "fail", "Missing."));
  } else {
    checks.push(makeCheck("user", "User configured", "pass", "Configured."));
  }

  if (!sshResult.attempted) {
    blockers.push("SSH verification was not attempted because host or user is missing.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", "Not attempted."));
  } else if (!sshResult.ok) {
    blockers.push("SSH read-only backup verification failed.");
    checks.push(makeCheck("ssh", "SSH reachable", "fail", redactSecret(sshResult.stderr || sshResult.stdout || "SSH failed.")));
  } else {
    checks.push(makeCheck("ssh", "SSH reachable", "pass", "Non-interactive SSH succeeded."));
  }

  if (remote.shell_ok === "shell_ok") checks.push(makeCheck("remote_shell", "Remote shell", "pass", "Read-only checks executed."));
  else if (sshResult.ok) {
    blockers.push("Remote verification script did not return the expected marker.");
    checks.push(makeCheck("remote_shell", "Remote shell", "fail", "Missing shell marker."));
  }

  if (remote.env_platform_db_path === canonicalDbPath) checks.push(makeCheck("env_db_path", "PLATFORM_DB_PATH", "pass", canonicalDbPath));
  else if (sshResult.ok) {
    blockers.push("Pi .env does not point PLATFORM_DB_PATH at the canonical DB.");
    checks.push(makeCheck("env_db_path", "PLATFORM_DB_PATH", "fail", remote.env_platform_db_path || "not set"));
  }

  if (remote.env_backup_path === canonicalBackupPath) checks.push(makeCheck("env_backup_path", "PLATFORM_BACKUP_PATH", "pass", canonicalBackupPath));
  else if (sshResult.ok) {
    blockers.push("Pi .env does not point PLATFORM_BACKUP_PATH at the canonical backup path.");
    checks.push(makeCheck("env_backup_path", "PLATFORM_BACKUP_PATH", "fail", remote.env_backup_path || "not set"));
  }

  if (remote.canonical_db === "present") checks.push(makeCheck("canonical_db", "Canonical DB", "pass", `Present${remote.canonical_db_size ? ` (${remote.canonical_db_size})` : ""}.`));
  else if (sshResult.ok) {
    blockers.push(`Canonical DB is missing: ${canonicalDbPath}`);
    checks.push(makeCheck("canonical_db", "Canonical DB", "fail", "Missing."));
  }

  if (remote.backup_path === "present") checks.push(makeCheck("backup_path", "Backup path", "pass", canonicalBackupPath));
  else if (sshResult.ok) {
    blockers.push(`Backup path is missing: ${canonicalBackupPath}`);
    checks.push(makeCheck("backup_path", "Backup path", "fail", "Missing."));
  }

  if (remote.backup_path_writable === "yes") checks.push(makeCheck("backup_writable", "Backup path writable", "pass", "Writable by SSH user."));
  else if (sshResult.ok) {
    blockers.push("Backup path is not writable by the SSH user.");
    checks.push(makeCheck("backup_writable", "Backup path writable", "fail", "Not writable."));
  }

  if (remote.sqlite3_path) checks.push(makeCheck("sqlite3", "sqlite3 available", "pass", remote.sqlite3_path));
  else if (sshResult.ok) {
    blockers.push("sqlite3 is not available on the Pi.");
    checks.push(makeCheck("sqlite3", "sqlite3 available", "fail", "Missing."));
  }

  if (remote.db_integrity === "ok") checks.push(makeCheck("db_integrity", "Canonical DB integrity", "pass", "ok"));
  else if (sshResult.ok) {
    blockers.push("Canonical DB integrity check failed.");
    checks.push(makeCheck("db_integrity", "Canonical DB integrity", "fail", remote.db_integrity || "unknown"));
  }

  if (runtimeDbPath === canonicalDbPath && runtimeBackupPath === canonicalBackupPath && runtime.json?.status === "READY") {
    checks.push(makeCheck("runtime_paths", "Runtime paths", "pass", "Canonical DB and backup paths active."));
  } else if (sshResult.ok) {
    blockers.push("Runtime paths do not confirm canonical DB and backup paths.");
    checks.push(makeCheck("runtime_paths", "Runtime paths", "fail", `DB ${runtimeDbPath || "unknown"}; backups ${runtimeBackupPath || "unknown"}.`));
  }

  if (latestBackups.length) {
    checks.push(makeCheck("latest_backups", "Latest backups", "pass", `${latestBackups.length} backup file(s) listed.`));
    if (remote.latest_backup_integrity === "ok") checks.push(makeCheck("latest_backup_integrity", "Latest backup integrity", "pass", "ok"));
    else {
      warnings.push("Latest backup integrity could not be confirmed.");
      checks.push(makeCheck("latest_backup_integrity", "Latest backup integrity", "warning", remote.latest_backup_integrity || "not checked"));
    }
  } else if (sshResult.ok) {
    checks.push(makeCheck("latest_backups", "Latest backups", "pass", "No backup files present yet."));
  }

  if (remote.service_active === "active") checks.push(makeCheck("service_active", "Service active", "pass", "active"));
  else if (sshResult.ok) {
    warnings.push("sentinel-api.service is not active. Backup path checks can still be valid, but service health should be reviewed.");
    checks.push(makeCheck("service_active", "Service active", "warning", remote.service_active || "unknown"));
  }

  const listenAddresses = String(remote.listen_addresses || "").split("|").filter(Boolean);
  if (listenAddresses.includes(`${apiHost}:${apiPort}`)) checks.push(makeCheck("api_listener", "API listener", "pass", listenAddresses.join(", ")));
  else if (sshResult.ok) checks.push(makeCheck("api_listener", "API listener", "warning", listenAddresses.join(", ") || "No listener."));

  const status = blockers.length ? "NOT_READY" : warnings.length ? "READY_WITH_WARNINGS" : "READY";
  return {
    status,
    checks,
    warnings,
    blockers,
    runtimePaths: runtime.json,
    latestBackups,
    plannedBackupPath: `${canonicalBackupPath}/platform.db.backup-<timestamp>`,
  };
}

function classifyBackup({ host, user, sshResult, remote, confirm }) {
  const verify = classifyVerify({ host, user, sshResult, remote });
  const plannedBackupPath = `${canonicalBackupPath}/platform.db.backup-<timestamp>`;

  if (!confirm) {
    return {
      ...verify,
      status: verify.blockers.length ? "NOT_READY" : "DRY_RUN_READY",
      backupResult: null,
      plannedBackupPath,
      recommendedNextStep: verify.blockers.length
        ? "Resolve backup blockers, then rerun npm run platform:pi:backup."
        : "Dry-run only. Rerun with --confirm only when a real Pi backup is explicitly approved.",
    };
  }

  const blockers = [...verify.blockers];
  const warnings = [...verify.warnings];
  const checks = [...verify.checks];

  if (remote.result === "success") {
    checks.push(makeCheck("backup_created", "Backup created", "pass", remote.backup_file));
    checks.push(makeCheck("backup_integrity", "Backup integrity", "pass", remote.backup_integrity || "ok"));
  } else {
    blockers.push(`Confirmed backup failed: ${remote.result || "unknown"}.`);
    checks.push(makeCheck("backup_created", "Backup created", "fail", remote.result || "unknown"));
  }

  const status = blockers.length ? "BACKUP_FAILED" : warnings.length ? "BACKUP_CREATED_WITH_WARNINGS" : "BACKUP_CREATED";
  return {
    status,
    checks,
    warnings,
    blockers,
    runtimePaths: verify.runtimePaths,
    latestBackups: verify.latestBackups,
    backupResult: {
      result: remote.result || "unknown",
      path: remote.backup_file || null,
      size: remote.backup_size || null,
      bytes: remote.backup_bytes ? Number(remote.backup_bytes) : null,
      integrity: remote.backup_integrity || null,
    },
    plannedBackupPath,
    recommendedNextStep: blockers.length
      ? "Review backup failure and do not delete any DB files."
      : "Backup created. Run npm run platform:pi:backup:verify and keep the API localhost-only.",
  };
}

function reportPaths(mode) {
  const base = mode === "verify" ? "sentinel-pi-backup-verify" : "sentinel-pi-backup";
  return {
    json: path.join(reportsDir, `${base}.json`),
    markdown: path.join(reportsDir, `${base}.md`),
  };
}

function buildReport({ mode, confirm, target, sshResult, remote, classification }) {
  return {
    checkedAt: new Date().toISOString(),
    mode,
    confirmed: confirm,
    status: classification.status,
    target: {
      ...target,
      canonicalDbPath,
      canonicalBackupPath,
      serviceName,
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
      gitCommit: remote.git_commit || "unknown",
      gitStatusCount: Number(remote.git_status_count || 0),
      canonicalDbSize: remote.canonical_db_size || "unknown",
      canonicalDbBytes: remote.canonical_db_bytes ? Number(remote.canonical_db_bytes) : null,
      canonicalDbModifiedAt: remote.canonical_db_mtime || "unknown",
      backupPath: remote.env_backup_path || canonicalBackupPath,
      backupCount: Number(remote.backup_count || 0),
      sqlite3: remote.sqlite3_path || "missing",
      sqlite3Version: remote.sqlite3_version || "unknown",
      serviceActive: remote.service_active || "unknown",
      listenAddresses: String(remote.listen_addresses || "").split("|").filter(Boolean),
    },
    latestBackups: classification.latestBackups,
    plannedBackupPath: classification.plannedBackupPath,
    backupResult: classification.backupResult,
    checks: classification.checks,
    warnings: classification.warnings,
    blockers: classification.blockers,
    mutation: mode === "backup" && confirm ? "created timestamped canonical DB backup if checks passed" : "none",
    recommendedNextStep: classification.recommendedNextStep || (
      classification.status === "READY"
        ? "Backup path is ready. Run npm run platform:pi:backup for the dry-run plan."
        : "Resolve backup blockers, then rerun the verifier."
    ),
  };
}

function statusIcon(status) {
  if (status === "pass") return "pass";
  if (status === "warning") return "warning";
  return "fail";
}

function buildMarkdown(report) {
  const lines = [
    report.mode === "verify" ? "# Sentinel Pi Backup Verification" : "# Sentinel Pi Backup",
    "",
    `Checked: ${report.checkedAt}`,
    `Status: ${report.status}`,
    `Mode: ${report.confirmed ? "confirmed" : report.mode === "backup" ? "dry-run" : "read-only"}`,
    "",
    "## Target",
    "",
    `- Host: ${report.target.host}`,
    `- App path: ${report.target.appPath}`,
    `- Canonical DB: ${report.target.canonicalDbPath}`,
    `- Backup path: ${report.target.canonicalBackupPath}`,
    `- API bind: ${report.target.apiHost}:${report.target.apiPort}`,
    "",
    "## Remote State",
    "",
    `- Hostname: ${report.remote.hostname}`,
    `- Git commit: ${report.remote.gitCommit}`,
    `- Canonical DB size: ${report.remote.canonicalDbSize}`,
    `- Canonical DB modified: ${report.remote.canonicalDbModifiedAt}`,
    `- Backup count: ${report.remote.backupCount}`,
    `- sqlite3: ${report.remote.sqlite3} ${report.remote.sqlite3Version}`,
    `- Service active: ${report.remote.serviceActive}`,
    `- Listen addresses: ${report.remote.listenAddresses.join(", ") || "none"}`,
    "",
    "## Backup Plan",
    "",
    `- Planned backup file: ${report.plannedBackupPath}`,
    "- Confirmed mode uses SQLite's online backup command and does not stop `sentinel-api.service`.",
    "- No old backups are deleted.",
  ];

  if (report.backupResult) {
    lines.push(
      "",
      "## Backup Result",
      "",
      `- Result: ${report.backupResult.result}`,
      `- Path: ${report.backupResult.path || "not created"}`,
      `- Size: ${report.backupResult.size || "unknown"}`,
      `- Integrity: ${report.backupResult.integrity || "unknown"}`,
    );
  }

  lines.push(
    "",
    "## Latest Backups",
    "",
    ...(report.latestBackups.length
      ? report.latestBackups.map((backup) => `- ${backup.name} (${backup.bytes} bytes)`)
      : ["- None found"]),
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
    "",
  );

  return `${lines.join("\n")}\n`;
}

function writeReports(report) {
  const paths = reportPaths(report.mode);
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(paths.json, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(paths.markdown, buildMarkdown(report), "utf8");
  return paths;
}

function printReport(report, paths) {
  console.log(report.mode === "verify" ? "Sentinel Pi Backup Verification" : "Sentinel Pi Backup");
  console.log("");
  console.log(`Host: ${report.target.host}`);
  console.log(`Status: ${report.status}`);
  console.log(`Mode: ${report.confirmed ? "confirmed" : report.mode === "backup" ? "dry-run" : "read-only"}`);
  console.log("");
  console.log("Paths:");
  console.log(`- Canonical DB: ${report.target.canonicalDbPath}`);
  console.log(`- Backup path: ${report.target.canonicalBackupPath}`);
  console.log(`- Planned backup: ${report.plannedBackupPath}`);
  console.log("");

  if (report.backupResult) {
    console.log("Backup result:");
    console.log(`- Result: ${report.backupResult.result}`);
    console.log(`- Path: ${report.backupResult.path || "not created"}`);
    console.log(`- Integrity: ${report.backupResult.integrity || "unknown"}`);
    console.log("");
  }

  console.log("Latest backups:");
  if (report.latestBackups.length) report.latestBackups.forEach((backup) => console.log(`- ${backup.name} (${backup.bytes} bytes)`));
  else console.log("- None found");
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
  console.log(`Reports written: ${path.relative(repoRoot, paths.markdown)}, ${path.relative(repoRoot, paths.json)}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode = args.verify ? "verify" : "backup";
  const host = configValue("RASPBERRY_PI_HOST", defaultHost);
  const user = configValue("RASPBERRY_PI_USER", defaultUser);
  const sshPort = configValue("RASPBERRY_PI_SSH_PORT", defaultPort);
  const appPath = configValue("RASPBERRY_PI_APP_PATH", defaultAppPath);
  const target = { host, sshUser: user, sshPort, appPath };
  const script = mode === "backup" && args.confirm ? confirmedBackupRemoteScript : readOnlyRemoteScript;
  const sshResult = runSsh({ host, user, sshPort, appPath, script, timeoutMs: args.confirm ? 60_000 : 45_000 });
  const remote = parseRemoteOutput(sshResult.stdout);
  const classification = mode === "verify"
    ? classifyVerify({ host, user, sshResult, remote })
    : classifyBackup({ host, user, sshResult, remote, confirm: args.confirm });
  const report = buildReport({ mode, confirm: args.confirm, target, sshResult, remote, classification });
  const paths = writeReports(report);
  printReport(report, paths);

  if (report.status === "NOT_READY" || report.status === "BACKUP_FAILED") process.exitCode = 1;
}

main();
