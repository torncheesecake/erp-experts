import {
  DEFAULT_DB_PATH,
  databaseExists,
  executeSql,
  queryRows,
  queryValue,
  tableExists,
} from "../../platform/persistence/db.js";
import { loadTenantConfig, printTenantError } from "./tenant_config.mjs";

const TABLES = [
  { name: "runs", dateExpr: "COALESCE(finished_at, started_at)" },
  { name: "snapshots", dateExpr: "created_at" },
  { name: "opportunity_summaries", dateExpr: "created_at" },
  { name: "plan_summaries", dateExpr: "created_at" },
  { name: "plan_approvals", dateExpr: "approved_at" },
  { name: "plan_statuses", dateExpr: "last_updated" },
  { name: "inbox_items", dateExpr: "created_at" },
];

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function quoteSql(value) {
  return String(value ?? "").replaceAll("'", "''");
}

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function cutoffIso(days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return cutoff.toISOString();
}

function idsToSql(ids) {
  return ids.length ? ids.map((id) => Number(id)).join(", ") : "NULL";
}

function latestIds({ tableName, tenantId, dateExpr, keepLatest }) {
  if (keepLatest <= 0) return [];

  return queryRows(
    `SELECT id
     FROM ${tableName}
     WHERE tenant_id = '${quoteSql(tenantId)}'
     ORDER BY datetime(${dateExpr}) DESC, id DESC
     LIMIT ${keepLatest};`,
    DEFAULT_DB_PATH,
  ).map(([id]) => Number(id));
}

function tableStats({ tableName, tenantId, dateExpr, cutoff, keepLatest }) {
  const protectedIds = latestIds({ tableName, tenantId, dateExpr, keepLatest });
  const protectedSql = idsToSql(protectedIds);
  const baseWhere = `tenant_id = '${quoteSql(tenantId)}'`;
  const eligibleWhere = `${baseWhere}
    AND datetime(${dateExpr}) < datetime('${quoteSql(cutoff)}')
    AND id NOT IN (${protectedSql})`;
  const total = Number(queryValue(`SELECT COUNT(*) FROM ${tableName} WHERE ${baseWhere};`, DEFAULT_DB_PATH) || 0);
  const eligible = Number(queryValue(`SELECT COUNT(*) FROM ${tableName} WHERE ${eligibleWhere};`, DEFAULT_DB_PATH) || 0);

  return {
    total,
    eligible,
    protectedCount: Math.min(protectedIds.length, total),
    kept: total - eligible,
    deleteSql: `DELETE FROM ${tableName} WHERE ${eligibleWhere};`,
  };
}

function main() {
  const confirmed = hasFlag("--confirm");
  const days = positiveInt(getArgValue("--days", "30"), 30);
  const keepLatest = positiveInt(getArgValue("--keep-latest", "20"), 20);
  const tenantId = getArgValue("--tenant", "erp-experts");
  const tenantResult = loadTenantConfig(tenantId);

  if (!tenantResult.ok) {
    printTenantError(tenantResult);
    process.exit(1);
  }

  if (!databaseExists(DEFAULT_DB_PATH)) {
    console.error("Platform DB is missing. Run npm run platform:init first.");
    process.exit(1);
  }

  const tenant = tenantResult.config;
  const cutoff = cutoffIso(days);
  const rows = [];
  let totalEligible = 0;
  let totalDeleted = 0;

  console.log("Sentinel DB Cleanup");
  console.log(`Mode: ${confirmed ? "CONFIRMED DELETE" : "DRY RUN"}`);
  console.log(`Tenant: ${tenant.name} (${tenant.tenantId})`);
  console.log(`Older than: ${days} day${days === 1 ? "" : "s"} (${cutoff})`);
  console.log(`Keep latest per table: ${keepLatest}`);
  console.log("");

  for (const table of TABLES) {
    if (!tableExists(table.name, DEFAULT_DB_PATH)) {
      console.log(`${table.name}: missing table, skipped`);
      continue;
    }

    const stats = tableStats({
      tableName: table.name,
      tenantId: tenant.tenantId,
      dateExpr: table.dateExpr,
      cutoff,
      keepLatest,
    });
    totalEligible += stats.eligible;

    let deleted = 0;
    if (confirmed && stats.eligible > 0) {
      executeSql(stats.deleteSql, DEFAULT_DB_PATH);
      deleted = stats.eligible;
      totalDeleted += deleted;
    }

    rows.push({
      table: table.name,
      total: stats.total,
      eligible: stats.eligible,
      protectedCount: stats.protectedCount,
      kept: stats.kept,
      deleted,
    });
  }

  rows.forEach((row) => {
    console.log(`${row.table}: total=${row.total}, eligible=${row.eligible}, kept=${row.kept}, protectedLatest=${row.protectedCount}, deleted=${row.deleted}`);
  });

  console.log("");
  console.log(`Eligible rows: ${totalEligible}`);
  console.log(`Deleted rows: ${totalDeleted}`);
  if (!confirmed) {
    console.log("Dry run only. Pass --confirm to delete eligible rows.");
  }
}

main();
