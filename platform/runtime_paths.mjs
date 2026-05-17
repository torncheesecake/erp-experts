import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "..");

export const runtimePathDefaults = {
  db: "platform/persistence/platform.db",
  reports: "reports",
  backups: "platform/persistence/backups",
  logs: "logs",
};

const runtimeEnvVars = {
  db: "PLATFORM_DB_PATH",
  reports: "PLATFORM_REPORT_OUTPUT_PATH",
  backups: "PLATFORM_BACKUP_PATH",
  logs: "PLATFORM_LOG_PATH",
};

function resolveRuntimePath(value, fallbackRelativePath) {
  const raw = value && String(value).trim() ? String(value).trim() : fallbackRelativePath;
  return path.isAbsolute(raw) ? path.normalize(raw) : path.resolve(repoRoot, raw);
}

function sourceFor(key) {
  const envVar = runtimeEnvVars[key];
  return process.env[envVar] && process.env[envVar].trim() ? "env" : "default";
}

export function getRuntimePaths() {
  return {
    db: resolveRuntimePath(process.env.PLATFORM_DB_PATH, runtimePathDefaults.db),
    reports: resolveRuntimePath(process.env.PLATFORM_REPORT_OUTPUT_PATH, runtimePathDefaults.reports),
    backups: resolveRuntimePath(process.env.PLATFORM_BACKUP_PATH, runtimePathDefaults.backups),
    logs: resolveRuntimePath(process.env.PLATFORM_LOG_PATH, runtimePathDefaults.logs),
  };
}

export function getRuntimePathSources() {
  return {
    db: sourceFor("db"),
    reports: sourceFor("reports"),
    backups: sourceFor("backups"),
    logs: sourceFor("logs"),
  };
}

export function getRuntimePathEnvVars() {
  return { ...runtimeEnvVars };
}

export function describeRuntimePath(key, filePath = getRuntimePaths()[key]) {
  const sources = getRuntimePathSources();
  return {
    key,
    path: filePath,
    relativePath: path.relative(repoRoot, filePath) || ".",
    source: sources[key] || "unknown",
    envVar: runtimeEnvVars[key] || null,
    exists: fs.existsSync(filePath),
    parentPath: path.dirname(filePath),
    parentExists: fs.existsSync(path.dirname(filePath)),
  };
}

export function describeRuntimePaths() {
  const paths = getRuntimePaths();
  return {
    db: describeRuntimePath("db", paths.db),
    reports: describeRuntimePath("reports", paths.reports),
    backups: describeRuntimePath("backups", paths.backups),
    logs: describeRuntimePath("logs", paths.logs),
  };
}

export function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function resolveReportPath(...segments) {
  return path.join(getRuntimePaths().reports, ...segments);
}
