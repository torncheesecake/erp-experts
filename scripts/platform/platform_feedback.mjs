import { addFeedbackItem, feedbackStatusSummary, getFeedbackOptions, listFeedbackItems } from "../../platform/feedback/feedback_store.mjs";

function parseArgs(argv) {
  const args = { add: false, list: false, statusOnly: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--add") args.add = true;
    else if (arg === "--list") args.list = true;
    else if (arg === "--status") {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args.status = next;
        i += 1;
      } else {
        args.statusOnly = true;
      }
    } else if (["--category", "--section", "--summary", "--limit"].includes(arg)) {
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
  console.log("npm run platform:feedback -- --list");
  console.log("npm run platform:feedback -- --status");
  console.log("");
  console.log(`Categories: ${options.categories.map((item) => item.id).join(", ")}`);
  console.log(`Sections: ${options.sections.join(", ")}`);
}

function printItems(items) {
  if (!items.length) {
    console.log("No feedback items recorded.");
    return;
  }

  for (const item of items) {
    console.log(`- ${item.createdAt} [${item.status}] ${item.category}/${item.section}`);
    console.log(`  ${item.summary}`);
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
  if (summary.latest) {
    console.log("");
    console.log(`Latest: ${summary.latest.category}/${summary.latest.section} - ${summary.latest.summary}`);
  }
}

const args = parseArgs(process.argv.slice(2));

try {
  if (args.add) {
    const item = addFeedbackItem({
      category: args.category,
      section: args.section,
      summary: args.summary,
      status: args.status || "new",
    });
    console.log("Sentinel Operator Feedback");
    console.log("");
    console.log("Added feedback item:");
    console.log(`${item.id} [${item.category}/${item.section}] ${item.summary}`);
    console.log("");
    console.log("Storage: reports/operator-feedback.json");
  } else if (args.list) {
    console.log("Sentinel Operator Feedback");
    console.log("");
    printItems(listFeedbackItems({
      category: args.category,
      section: args.section,
      status: args.status,
      limit: args.limit,
    }));
  } else if (args.statusOnly) {
    printStatus();
  } else {
    printUsage();
  }
} catch (error) {
  console.error(`Feedback error: ${error.message}`);
  process.exit(1);
}
