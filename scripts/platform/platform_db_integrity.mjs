import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

export const requiredTables = [
  "tenants",
  "runs",
  "snapshots",
  "opportunity_summaries",
  "plan_summaries",
  "plan_approvals",
  "plan_statuses",
  "inbox_items",
];

export function defaultDbPath() {
  return path.join(repoRoot, "platform/persistence/platform.db");
}

function runSqlite(dbPath, sql) {
  const result = spawnSync("sqlite3", ["-noheader", "-batch", "-separator", "\t", dbPath, sql], {
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || "sqlite3 failed").trim());
  }

  return (result.stdout || "").trim();
}

function queryRows(dbPath, sql) {
  const output = runSqlite(dbPath, sql);
  if (!output) return [];
  return output.split("\n").map((line) => line.split("\t"));
}

function tableExists(dbPath, tableName) {
  const escaped = String(tableName).replaceAll("'", "''");
  return runSqlite(
    dbPath,
    `SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = '${escaped}';`,
  ) === "1";
}

export function checkDbIntegrity(dbPath = defaultDbPath()) {
  const resolvedPath = path.resolve(dbPath);
  const result = {
    dbPath: resolvedPath,
    exists: fs.existsSync(resolvedPath),
    readable: false,
    integrity: "unknown",
    requiredTables: [],
    missingTables: [],
    rowCounts: {},
    latestSnapshot: null,
    latestRun: null,
    fileSizeBytes: 0,
    modifiedAt: null,
    errors: [],
  };

  if (!result.exists) {
    result.errors.push(`DB file does not exist: ${resolvedPath}`);
    return result;
  }

  try {
    const stat = fs.statSync(resolvedPath);
    result.fileSizeBytes = stat.size;
    result.modifiedAt = stat.mtime.toISOString();
  } catch (error) {
    result.errors.push(`Could not stat DB file: ${error.message}`);
  }

  try {
    result.integrity = runSqlite(resolvedPath, "PRAGMA integrity_check;");
    result.readable = result.integrity === "ok";
  } catch (error) {
    result.errors.push(`Could not run integrity_check: ${error.message}`);
    return result;
  }

  requiredTables.forEach((tableName) => {
    if (!tableExists(resolvedPath, tableName)) {
      result.missingTables.push(tableName);
      return;
    }

    result.requiredTables.push(tableName);
    result.rowCounts[tableName] = Number(runSqlite(resolvedPath, `SELECT COUNT(*) FROM ${tableName};`) || 0);
  });

  if (tableExists(resolvedPath, "snapshots")) {
    const row = queryRows(
      resolvedPath,
      `SELECT id, tenant_id, pass_count, review_count, blocked_count, monitor_status, created_at
       FROM snapshots
       ORDER BY created_at DESC, id DESC
       LIMIT 1;`,
    )[0];
    if (row) {
      const [id, tenantId, passCount, reviewCount, blockedCount, monitorStatus, createdAt] = row;
      result.latestSnapshot = {
        id: Number(id),
        tenantId,
        passCount: Number(passCount || 0),
        reviewCount: Number(reviewCount || 0),
        blockedCount: Number(blockedCount || 0),
        monitorStatus,
        createdAt,
      };
    }
  }

  if (tableExists(resolvedPath, "runs")) {
    const row = queryRows(
      resolvedPath,
      `SELECT id, tenant_id, command, status, COALESCE(started_at, ''), COALESCE(finished_at, '')
       FROM runs
       ORDER BY COALESCE(finished_at, started_at) DESC, id DESC
       LIMIT 1;`,
    )[0];
    if (row) {
      const [id, tenantId, command, status, startedAt, finishedAt] = row;
      result.latestRun = {
        id: Number(id),
        tenantId,
        command,
        status,
        startedAt,
        finishedAt,
      };
    }
  }

  if (result.missingTables.length) {
    result.errors.push(`Missing required tables: ${result.missingTables.join(", ")}`);
  }

  return result;
}

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function main() {
  const dbPath = getArgValue("--db-path", process.env.PLATFORM_DB_PATH || defaultDbPath());
  const json = process.argv.includes("--json");
  const result = checkDbIntegrity(dbPath);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    console.log("Sentinel DB Integrity");
    console.log(`DB: ${path.relative(repoRoot, result.dbPath) || result.dbPath}`);
    console.log(`Exists: ${result.exists ? "yes" : "no"}`);
    console.log(`Integrity: ${result.integrity}`);
    console.log(`Required tables: ${result.requiredTables.length}/${requiredTables.length}`);
    Object.entries(result.rowCounts).forEach(([tableName, count]) => {
      console.log(`${tableName}: ${count}`);
    });
    if (result.latestSnapshot) {
      console.log(`Latest snapshot: ${result.latestSnapshot.monitorStatus} ${result.latestSnapshot.createdAt}`);
    }
    if (result.latestRun) {
      console.log(`Latest run: ${result.latestRun.command} ${result.latestRun.status}`);
    }
    if (result.errors.length) {
      console.error("Errors:");
      result.errors.forEach((error) => console.error(`- ${error}`));
    }
  }

  if (!result.exists || !result.readable || result.errors.length) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main();
}
