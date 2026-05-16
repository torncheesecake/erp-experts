import {
  addFeedbackItem,
  FEEDBACK_BACKLOG_PATH,
  feedbackStatusSummary,
  getFeedbackBacklogGroups,
  getFeedbackOptions,
  listFeedbackItems,
  triageFeedbackItem,
  writeFeedbackBacklogReport,
} from "../../platform/feedback/feedback_store.mjs";

function parseArgs(argv) {
  const args = { add: false, list: false, statusOnly: false, backlog: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--add") args.add = true;
    else if (arg === "--list") args.list = true;
    else if (arg === "--backlog") args.backlog = true;
    else if (arg === "--triage") {
      args.triage = argv[i + 1] || "";
      i += 1;
    }
    else if (arg === "--status") {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args.status = next;
        i += 1;
      } else {
        args.statusOnly = true;
      }
    } else if (["--category", "--section", "--summary", "--limit", "--priority", "--effort", "--triage-status", "--note", "--owner", "--linked-command", "--linked-section"].includes(arg)) {
      const key = arg.replace(/^--/, "");
      args[key] = argv[i + 1] || "";
      i += 1;
    }
  }
  return args;
}

function printUsage() {
  const options = getFeedbackOptions();
  console.log("Sentinel Operator Feedback");
  console.log("");
  console.log("Usage:");
  console.log("npm run platform:feedback -- --add --category ux --section actions --summary \"Need clearer action grouping\"");
  console.log("npm run platform:feedback -- --triage fb-123 --priority high --effort low --triage-status accepted --note \"Do this next\"");
  console.log("npm run platform:feedback -- --backlog");
  console.log("npm run platform:feedback -- --list");
  console.log("npm run platform:feedback -- --status");
  console.log("");
  console.log(`Categories: ${options.categories.map((item) => item.id).join(", ")}`);
  console.log(`Sections: ${options.sections.join(", ")}`);
  console.log(`Priorities: ${options.priorities.join(", ")}`);
  console.log(`Efforts: ${options.efforts.join(", ")}`);
  console.log(`Triage statuses: ${options.triageStatuses.join(", ")}`);
}

function printItems(items) {
  if (!items.length) {
    console.log("No feedback items recorded.");
    return;
  }

  for (const item of items) {
    console.log(`- ${item.createdAt} [${item.triageStatus}] ${item.category}/${item.section}`);
    console.log(`  ${item.summary}`);
    console.log(`  priority=${item.priority} effort=${item.effort}`);
    if (item.owner) console.log(`  owner=${item.owner}`);
    if (item.linkedCommand) console.log(`  linkedCommand=${item.linkedCommand}`);
    if (item.notes?.length) console.log(`  latestNote=${item.notes[item.notes.length - 1].note}`);
    console.log(`  id: ${item.id}`);
  }
}

function printStatus() {
  const summary = feedbackStatusSummary();
  console.log("Sentinel Operator Feedback Status");
  console.log("");
  console.log(`Total: ${summary.total}`);
  console.log("By status:");
  for (const [status, count] of Object.entries(summary.byStatus)) {
    console.log(`- ${status}: ${count}`);
  }
  console.log("By category:");
  for (const [category, count] of Object.entries(summary.byCategory)) {
    console.log(`- ${category}: ${count}`);
  }
  console.log("By triage status:");
  for (const [status, count] of Object.entries(summary.byTriageStatus)) {
    console.log(`- ${status}: ${count}`);
  }
  console.log("By priority:");
  for (const [priority, count] of Object.entries(summary.byPriority)) {
    console.log(`- ${priority}: ${count}`);
  }
  if (summary.latest) {
    console.log("");
    console.log(`Latest: ${summary.latest.category}/${summary.latest.section} [${summary.latest.priority}/${summary.latest.triageStatus}] - ${summary.latest.summary}`);
  }
}

function printBacklogGroup(title, items) {
  console.log(title);
  if (!items.length) {
    console.log("- None");
    return;
  }
  for (const item of items) {
    console.log(`- ${item.summary}`);
    console.log(`  ${item.id} · ${item.priority} priority · ${item.effort} effort · ${item.triageStatus} · ${item.category}/${item.section}`);
  }
}

function printBacklog() {
  const groups = getFeedbackBacklogGroups();
  const reportPath = writeFeedbackBacklogReport();

  console.log("Sentinel Feedback Backlog");
  console.log("");
  printBacklogGroup("Critical and high", groups.high);
  console.log("");
  printBacklogGroup("Medium", groups.medium);
  console.log("");
  printBacklogGroup("Low or deferred", groups.lowDeferred);
  console.log("");
  console.log("Suggested next improvement:");
  if (groups.suggestedNext) {
    console.log(`${groups.suggestedNext.summary} (${groups.suggestedNext.id})`);
  } else {
    console.log("No actionable feedback captured yet.");
  }
  console.log("");
  console.log(`Backlog report: ${reportPath.replace(process.cwd(), ".")}`);
}

const args = parseArgs(process.argv.slice(2));

try {
  if (args.triage) {
    const item = triageFeedbackItem({
      id: args.triage,
      priority: args.priority,
      effort: args.effort,
      triageStatus: args["triage-status"],
      note: args.note,
      owner: args.owner,
      linkedCommand: args["linked-command"],
      linkedSection: args["linked-section"],
    });
    console.log("Sentinel Operator Feedback");
    console.log("");
    console.log("Triaged feedback item:");
    console.log(`${item.id} [${item.priority}/${item.effort}/${item.triageStatus}] ${item.summary}`);
    if (args.note) console.log(`Note: ${args.note}`);
  } else if (args.backlog) {
    printBacklog();
  } else if (args.add) {
    const item = addFeedbackItem({
      category: args.category,
      section: args.section,
      summary: args.summary,
      status: args.status || "new",
      priority: args.priority || "medium",
      effort: args.effort || "medium",
      triageStatus: args["triage-status"] || "new",
      owner: args.owner || "",
      linkedCommand: args["linked-command"] || "",
      linkedSection: args["linked-section"] || "",
    });
    console.log("Sentinel Operator Feedback");
    console.log("");
    console.log("Added feedback item:");
    console.log(`${item.id} [${item.category}/${item.section}] ${item.summary}`);
    console.log(`Priority: ${item.priority}`);
    console.log(`Effort: ${item.effort}`);
    console.log(`Triage: ${item.triageStatus}`);
    console.log("");
    console.log("Storage: reports/operator-feedback.json");
  } else if (args.list) {
    console.log("Sentinel Operator Feedback");
    console.log("");
    printItems(listFeedbackItems({
      category: args.category,
      section: args.section,
      status: args.status,
      priority: args.priority,
      effort: args.effort,
      triageStatus: args["triage-status"],
      limit: args.limit,
    }));
  } else if (args.statusOnly) {
    printStatus();
  } else {
    printUsage();
  }
} catch (error) {
  console.error(`Feedback error: ${error.message}`);
  if (error.code === "FEEDBACK_NOT_FOUND") {
    console.error("Run npm run platform:feedback -- --list to inspect local feedback IDs.");
  }
  if (error.code !== "FEEDBACK_VALIDATION_ERROR" && error.code !== "FEEDBACK_NOT_FOUND") {
    console.error(`Backlog output path: ${FEEDBACK_BACKLOG_PATH}`);
  }
  process.exit(1);
}
