import { DEFAULT_DB_PATH, databaseExists, finishRun, logRun, startRun } from "../../platform/persistence/db.js";

function warn(command, message) {
  console.warn(`[${command}] SQLite run log warning: ${message}`);
}

export function safeStartRun({ tenantId, command }) {
  if (!databaseExists(DEFAULT_DB_PATH)) return null;

  try {
    return startRun({ tenantId, command });
  } catch (error) {
    warn(command, error.message);
    return null;
  }
}

export function safeFinishRun({ runId, command, status }) {
  if (!runId || !databaseExists(DEFAULT_DB_PATH)) return;

  try {
    finishRun({ runId, status });
  } catch (error) {
    warn(command, error.message);
  }
}

export function safeLogRun({ tenantId, command, status, startedAt, finishedAt }) {
  if (!databaseExists(DEFAULT_DB_PATH)) return;

  try {
    logRun({ tenantId, command, status, startedAt, finishedAt });
  } catch (error) {
    warn(command, error.message);
  }
}
