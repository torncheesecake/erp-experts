import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot } from "./tenant_config.mjs";

export const approvalModes = new Set(["none", "operator_required", "review_required"]);
export const executionModes = new Set(["manual", "scheduled", "hybrid"]);
export const scheduleModes = new Set(["disabled", "daily", "weekly", "custom_future"]);
export const maxFrequencies = new Set(["once_per_day", "once_per_hour", "manual_only"]);

const pipelinesPath = path.join(repoRoot, "platform/pipelines/pipelines.json");
const actionsPath = path.join(repoRoot, "platform/actions/actions.json");
const dangerousActionPatterns = [
  /deploy/i,
  /cleanup/i,
  /restore/i,
  /ftp/i,
  /service/i,
  /systemctl/i,
  /publish/i,
  /plan:run/i,
];

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return Array.from(duplicates);
}

function addFailure(result, message) {
  result.failures.push(message);
}

function addWarning(result, message) {
  result.warnings.push(message);
}

function actionLooksDangerous(action) {
  const haystack = `${action?.id || ""} ${action?.command || ""} ${action?.label || ""}`;
  return dangerousActionPatterns.some((pattern) => pattern.test(haystack));
}

function loadRegistry(filePath, key, result, label) {
  if (!fs.existsSync(filePath)) {
    addFailure(result, `${label} registry is missing: ${path.relative(repoRoot, filePath)}.`);
    return [];
  }

  try {
    const registry = readJson(filePath);
    if (!Array.isArray(registry[key])) {
      addFailure(result, `${label} registry must include a ${key} array.`);
      return [];
    }
    return registry[key];
  } catch (error) {
    addFailure(result, `${label} registry could not be parsed: ${error.message}.`);
    return [];
  }
}

function validatePipelineShape(pipeline, result) {
  const id = pipeline?.id || "unknown";

  if (!pipeline || typeof pipeline !== "object" || Array.isArray(pipeline)) {
    addFailure(result, "Pipeline registry contains a non-object entry.");
    return;
  }

  for (const field of ["id", "label", "description", "category", "riskLevel", "approvalMode", "executionMode", "scheduleMode", "maxFrequency", "safetyNotes"]) {
    if (pipeline[field] === undefined || pipeline[field] === null || pipeline[field] === "") {
      addFailure(result, `Pipeline ${id} is missing ${field}.`);
    }
  }

  if (!approvalModes.has(pipeline.approvalMode)) {
    addFailure(result, `Pipeline ${id} has invalid approvalMode: ${pipeline.approvalMode}.`);
  }

  if (!executionModes.has(pipeline.executionMode)) {
    addFailure(result, `Pipeline ${id} has invalid executionMode: ${pipeline.executionMode}.`);
  }

  if (!scheduleModes.has(pipeline.scheduleMode)) {
    addFailure(result, `Pipeline ${id} has invalid scheduleMode: ${pipeline.scheduleMode}.`);
  }

  if (!maxFrequencies.has(pipeline.maxFrequency)) {
    addFailure(result, `Pipeline ${id} has invalid maxFrequency: ${pipeline.maxFrequency}.`);
  }

  if (typeof pipeline.requiresReview !== "boolean") {
    addFailure(result, `Pipeline ${id} must define requiresReview as boolean.`);
  }

  if (typeof pipeline.allowScheduling !== "boolean") {
    addFailure(result, `Pipeline ${id} must define allowScheduling as boolean.`);
  }

  if (pipeline.approvalMode === "review_required" && pipeline.requiresReview !== true) {
    addFailure(result, `Pipeline ${id} uses review_required but requiresReview is not true.`);
  }

  if (pipeline.scheduleMode === "disabled" && pipeline.allowScheduling) {
    addFailure(result, `Pipeline ${id} has scheduleMode disabled but allowScheduling is true.`);
  }

  if (pipeline.scheduleMode !== "disabled" && !pipeline.allowScheduling) {
    addFailure(result, `Pipeline ${id} has scheduleMode ${pipeline.scheduleMode} but allowScheduling is false.`);
  }

  if (pipeline.allowScheduling && pipeline.maxFrequency === "manual_only") {
    addFailure(result, `Pipeline ${id} allows scheduling but maxFrequency is manual_only.`);
  }

  if (!pipeline.allowScheduling && pipeline.maxFrequency !== "manual_only") {
    addWarning(result, `Pipeline ${id} is not schedulable but maxFrequency is ${pipeline.maxFrequency}.`);
  }

  if (pipeline.executionMode === "scheduled" && !pipeline.allowScheduling) {
    addFailure(result, `Pipeline ${id} uses scheduled executionMode but scheduling is not allowed.`);
  }

  if (!Array.isArray(pipeline.tags) || pipeline.tags.length === 0) {
    addFailure(result, `Pipeline ${id} must include at least one tag.`);
  }

  if (!Array.isArray(pipeline.steps) || pipeline.steps.length === 0) {
    addFailure(result, `Pipeline ${id} must include at least one step.`);
  }
}

export function validatePipelineRegistry() {
  const result = {
    status: "pass",
    pipelinesChecked: 0,
    actionsChecked: 0,
    schedulablePipelines: [],
    manualOnlyPipelines: [],
    warnings: [],
    failures: [],
  };

  const actions = loadRegistry(actionsPath, "actions", result, "Action");
  const pipelines = loadRegistry(pipelinesPath, "pipelines", result, "Pipeline");
  const actionsById = new Map(actions.filter((action) => action?.id).map((action) => [action.id, action]));

  result.actionsChecked = actions.length;
  result.pipelinesChecked = pipelines.length;

  duplicateValues(actions.map((action) => action?.id).filter(Boolean)).forEach((actionId) => {
    addFailure(result, `Duplicate action ID: ${actionId}.`);
  });

  duplicateValues(pipelines.map((pipeline) => pipeline?.id).filter(Boolean)).forEach((pipelineId) => {
    addFailure(result, `Duplicate pipeline ID: ${pipelineId}.`);
  });

  for (const pipeline of pipelines) {
    validatePipelineShape(pipeline, result);
    const pipelineId = pipeline?.id || "unknown";
    const steps = Array.isArray(pipeline?.steps) ? pipeline.steps : [];

    for (const [index, step] of steps.entries()) {
      const actionId = step?.actionId || step?.action || "";
      const action = actionsById.get(actionId);

      if (!actionId) {
        addFailure(result, `Pipeline ${pipelineId} step ${index + 1} is missing actionId.`);
        continue;
      }

      if (!action) {
        addFailure(result, `Pipeline ${pipelineId} step ${index + 1} references unknown action ${actionId}.`);
        continue;
      }

      if (!action.allowFromUI) {
        addFailure(result, `Pipeline ${pipelineId} step ${index + 1} references non-UI action ${actionId}.`);
      }

      if (actionLooksDangerous(action)) {
        addFailure(result, `Pipeline ${pipelineId} step ${index + 1} references dangerous action ${actionId}.`);
      }
    }

    if (pipeline?.allowScheduling) {
      result.schedulablePipelines.push(pipelineId);
    } else if (pipeline?.id) {
      result.manualOnlyPipelines.push(pipelineId);
    }
  }

  result.status = result.failures.length ? "fail" : result.warnings.length ? "warn" : "pass";
  return result;
}

function printText(result) {
  console.log("Sentinel Pipeline Validation");
  console.log("");
  console.log(`Pipelines checked: ${result.pipelinesChecked}`);
  console.log(`Actions checked: ${result.actionsChecked}`);
  console.log(`Schedulable pipelines: ${result.schedulablePipelines.length}`);
  console.log(`Manual-only pipelines: ${result.manualOnlyPipelines.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log(`Failures: ${result.failures.length}`);
  console.log(`Status: ${result.status.toUpperCase()}`);

  if (result.warnings.length) {
    console.log("");
    console.log("Warnings:");
    for (const warning of result.warnings) console.log(`- ${warning}`);
  }

  if (result.failures.length) {
    console.log("");
    console.log("Failures:");
    for (const failure of result.failures) console.log(`- ${failure}`);
  }
}

function main() {
  const result = validatePipelineRegistry();

  if (hasFlag("--json")) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    printText(result);
  }

  if (result.status === "fail") process.exit(1);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main();
}
