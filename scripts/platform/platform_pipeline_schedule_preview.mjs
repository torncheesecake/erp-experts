import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./tenant_config.mjs";
import { validatePipelineRegistry } from "./platform_pipeline_validate.mjs";

const pipelinesPath = path.join(repoRoot, "platform/pipelines/pipelines.json");

function readPipelines() {
  const registry = JSON.parse(fs.readFileSync(pipelinesPath, "utf8"));
  return Array.isArray(registry.pipelines) ? registry.pipelines : [];
}

function approvalLabel(pipeline) {
  if (pipeline.approvalMode === "review_required") return "review required";
  if (pipeline.approvalMode === "operator_required") return "operator approval required";
  return "no approval metadata";
}

function cadenceLabel(pipeline) {
  if (pipeline.scheduleMode === "daily") return "daily";
  if (pipeline.scheduleMode === "weekly") return "weekly";
  if (pipeline.scheduleMode === "custom_future") return "custom future schedule";
  return "manual only";
}

function suggestedCadence(pipeline) {
  if (!pipeline.allowScheduling) return "blocked from scheduling";
  if (pipeline.id === "stakeholder-update") return "weekly, after stakeholder copy review";
  if (pipeline.scheduleMode === "daily") return "daily during operator working days";
  if (pipeline.scheduleMode === "weekly") return "weekly";
  return "future custom schedule";
}

function printPreview(pipelines, validation) {
  const schedulable = pipelines.filter((pipeline) => pipeline.allowScheduling);
  const blocked = pipelines.filter((pipeline) => !pipeline.allowScheduling);

  console.log("Sentinel Pipeline Scheduling Preview");
  console.log("");
  console.log("No cron jobs, systemd timers or background schedules are installed by this command.");
  console.log("");

  console.log("Schedulable Pipelines:");
  if (schedulable.length) {
    for (const pipeline of schedulable) {
      console.log(`- ${pipeline.id} -> ${cadenceLabel(pipeline)}; ${approvalLabel(pipeline)}; max ${pipeline.maxFrequency}; suggested ${suggestedCadence(pipeline)}`);
    }
  } else {
    console.log("- none");
  }

  console.log("");
  console.log("Scheduling Blocked or Manual Only:");
  if (blocked.length) {
    for (const pipeline of blocked) {
      console.log(`- ${pipeline.id} -> ${cadenceLabel(pipeline)}; ${pipeline.safetyNotes || "Manual execution only."}`);
    }
  } else {
    console.log("- none");
  }

  if (validation.warnings.length) {
    console.log("");
    console.log("Validation Warnings:");
    for (const warning of validation.warnings) console.log(`- ${warning}`);
  }

  if (validation.failures.length) {
    console.log("");
    console.log("Validation Failures:");
    for (const failure of validation.failures) console.log(`- ${failure}`);
  }

  console.log("");
  console.log(`Validation status: ${validation.status.toUpperCase()}`);
}

function main() {
  const validation = validatePipelineRegistry();
  const pipelines = readPipelines();
  printPreview(pipelines, validation);
  if (validation.status === "fail") process.exit(1);
}

main();
