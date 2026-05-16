import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getOperationalSummary } from "../../platform/api/state_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const summaryPath = path.join(repoRoot, "reports/sentinel-cadence-summary.json");
const tenantId = getArgValue("--tenant", process.env.PLATFORM_TENANT || "erp-experts");
const dryRun = process.argv.includes("--dry-run");
const stakeholderOnly = process.argv.includes("--stakeholder-only");
const operatorOnly = process.argv.includes("--operator-only");
const dailyMode = process.argv.includes("--daily");

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath);
}

function runNpm(script, args = []) {
  const result = spawnSync("npm", ["run", script, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });

  return {
    script,
    ok: result.status === 0,
    status: result.status ?? 1,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function taskPlan() {
  if (stakeholderOnly && operatorOnly) {
    throw new Error("Use either --stakeholder-only or --operator-only, not both.");
  }

  if (stakeholderOnly) {
    return [
      { script: "platform:stakeholder", label: "Generate stakeholder weekly report" },
      { script: "platform:notify", args: ["--", "--stakeholder"], label: "Generate stakeholder notification payload" },
    ];
  }

  if (operatorOnly) {
    return [
      { script: "platform:state", label: "Refresh Sentinel state" },
      { script: "platform:daily", label: "Generate daily operator report" },
      { script: "platform:notify", args: ["--", "--operator"], label: "Generate operator notification payload" },
    ];
  }

  return [
    { script: "seo:monitor", label: "Refresh SEO monitor" },
    { script: "platform:state", label: "Refresh Sentinel state" },
    { script: "platform:daily", label: "Generate daily operator report" },
    { script: "platform:stakeholder", label: "Generate stakeholder weekly report" },
    { script: "platform:notify", args: ["--", "--all"], label: "Generate notification payloads" },
  ];
}

function taskCommand(task) {
  return [task.script, ...(task.args || [])].join(" ");
}

function generatedReportsFor(tasks) {
  const reports = [];
  if (tasks.some((task) => task.script === "platform:state")) {
    reports.push("reports/sentinel-state.json");
  }
  if (tasks.some((task) => task.script === "platform:daily")) {
    reports.push("reports/sentinel-daily-operator-report.md");
  }
  if (tasks.some((task) => task.script === "platform:stakeholder")) {
    reports.push("reports/sentinel-stakeholder-weekly-report.md");
  }
  reports.push("reports/sentinel-cadence-summary.json");
  return reports;
}

function notificationsFor(tasks) {
  const hasNotifyAll = tasks.some((task) => task.script === "platform:notify" && task.args?.includes("--all"));
  const hasOperator = hasNotifyAll || tasks.some((task) => task.script === "platform:notify" && task.args?.includes("--operator"));
  const hasStakeholder = hasNotifyAll || tasks.some((task) => task.script === "platform:notify" && task.args?.includes("--stakeholder"));

  return {
    notificationsGenerated: hasOperator || hasStakeholder,
    operatorNotificationPath: hasOperator ? "reports/notifications/operator-notification.md" : null,
    stakeholderNotificationPath: hasStakeholder ? "reports/notifications/stakeholder-notification.md" : null,
    notificationMode: hasOperator && hasStakeholder ? "all" : hasOperator ? "operator" : hasStakeholder ? "stakeholder" : "none",
    stakeholderSafetyStatus: hasStakeholder ? "passed" : "not_applicable",
  };
}

function writeSummary({ tasksRun, state, generatedReports, notificationSummary }) {
  const summary = {
    ranAt: new Date().toISOString(),
    tenantId: state.tenant.tenantId,
    mode: stakeholderOnly ? "stakeholder-only" : operatorOnly ? "operator-only" : dailyMode ? "daily" : "full",
    tasksRun,
    health: {
      status: state.health.monitorStatus,
      pass: state.health.pass,
      review: state.health.review,
      blocked: state.health.blocked,
    },
    workflow: state.workflow.state,
    generatedReports,
    ...notificationSummary,
    nextStep: state.recommendation.nextStep,
  };

  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  return summary;
}

function printDryRun(tasks) {
  console.log("Sentinel Automation Cadence");
  console.log("");
  console.log("Mode: dry-run");
  console.log("");
  console.log("Would run:");
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${taskCommand(task)} - ${task.label}`);
  });
  console.log("");
  console.log("Would generate:");
  generatedReportsFor(tasks).forEach((report) => console.log(`- ${report}`));
  const notificationSummary = notificationsFor(tasks);
  if (notificationSummary.notificationsGenerated) {
    console.log("");
    console.log("Notifications:");
    if (notificationSummary.operatorNotificationPath) console.log("- operator payload would be generated");
    if (notificationSummary.stakeholderNotificationPath) console.log("- stakeholder payload would be generated");
    console.log("- No messages sent.");
  }
  console.log("");
  console.log("No commands executed.");
}

function printSummary(summary) {
  console.log("Sentinel Automation Cadence");
  console.log("");
  console.log(`Health: ${summary.health.status}`);
  console.log(`QA: ${summary.health.pass}/${summary.health.review}/${summary.health.blocked}`);
  console.log(`Workflow: ${summary.workflow}`);
  console.log("");
  console.log("Reports generated:");
  summary.generatedReports.forEach((report) => console.log(`- ${report}`));
  console.log("");
  console.log("Notifications:");
  if (summary.operatorNotificationPath) console.log("operator payload generated");
  if (summary.stakeholderNotificationPath) console.log("stakeholder payload generated");
  if (!summary.notificationsGenerated) console.log("none");
  console.log("No messages sent.");
  console.log("");
  console.log("Next focus:");
  console.log(summary.nextStep);
  console.log("");
  console.log(`Summary: ${rel(summaryPath)}`);
}

function main() {
  const tasks = taskPlan();

  if (dryRun) {
    printDryRun(tasks);
    return;
  }

  const tasksRun = [];
  for (const task of tasks) {
    const result = runNpm(task.script, task.args || []);
    tasksRun.push({
      script: taskCommand(task),
      label: task.label,
      status: result.ok ? "success" : "failed",
    });

    if (!result.ok) {
      console.error(`${task.script} failed.`);
      const firstLine = result.output.split(/\r?\n/).find(Boolean);
      if (firstLine) console.error(firstLine);
      process.exit(result.status || 1);
    }
  }

  const state = getOperationalSummary(tenantId);
  const generatedReports = generatedReportsFor(tasks);
  const notificationSummary = notificationsFor(tasks);
  const summary = writeSummary({ tasksRun, state, generatedReports, notificationSummary });
  printSummary(summary);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
