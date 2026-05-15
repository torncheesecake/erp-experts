import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

export const DEFAULT_DB_PATH = path.join(__dirname, "platform.db");
export const SCHEMA_PATH = path.join(__dirname, "schema.sql");

function runSqlite(args, input = "") {
  const result = spawnSync("sqlite3", args, {
    cwd: repoRoot,
    input,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || "sqlite3 failed").trim());
  }

  return result.stdout || "";
}

function quoteSql(value) {
  return String(value ?? "").replaceAll("'", "''");
}

export function ensurePersistenceDir() {
  fs.mkdirSync(__dirname, { recursive: true });
}

export function databaseExists(dbPath = DEFAULT_DB_PATH) {
  return fs.existsSync(dbPath);
}

export function applySchema(dbPath = DEFAULT_DB_PATH) {
  ensurePersistenceDir();
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  runSqlite([dbPath], schema);
}

export function executeSql(sql, dbPath = DEFAULT_DB_PATH) {
  ensurePersistenceDir();
  runSqlite([dbPath], sql);
}

export function queryValue(sql, dbPath = DEFAULT_DB_PATH) {
  const output = runSqlite(["-noheader", "-batch", dbPath, sql]).trim();
  return output;
}

export function upsertTenant(tenant, dbPath = DEFAULT_DB_PATH) {
  executeSql(
    `INSERT INTO tenants (tenant_id, name, domain)
     VALUES ('${quoteSql(tenant.tenantId)}', '${quoteSql(tenant.name)}', '${quoteSql(tenant.domain)}')
     ON CONFLICT(tenant_id) DO UPDATE SET
       name = excluded.name,
       domain = excluded.domain;`,
    dbPath,
  );
}

export function insertSnapshot(snapshot, dbPath = DEFAULT_DB_PATH) {
  executeSql(
    `INSERT INTO snapshots (tenant_id, pass_count, review_count, blocked_count, monitor_status)
     VALUES (
       '${quoteSql(snapshot.tenantId)}',
       ${Number(snapshot.passCount || 0)},
       ${Number(snapshot.reviewCount || 0)},
       ${Number(snapshot.blockedCount || 0)},
       '${quoteSql(snapshot.monitorStatus)}'
     );`,
    dbPath,
  );
}

export function getPersistenceSummary(dbPath = DEFAULT_DB_PATH) {
  return {
    dbPath,
    exists: databaseExists(dbPath),
    tenantCount: Number(queryValue("SELECT COUNT(*) FROM tenants;", dbPath) || 0),
    runCount: Number(queryValue("SELECT COUNT(*) FROM runs;", dbPath) || 0),
    snapshotCount: Number(queryValue("SELECT COUNT(*) FROM snapshots;", dbPath) || 0),
    erpExpertsTenantExists: queryValue("SELECT COUNT(*) FROM tenants WHERE tenant_id = 'erp-experts';", dbPath) === "1",
  };
}
